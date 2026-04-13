import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { getConnection } from 'typeorm';

import { AppModule } from '../../src/app.module';
import { DonationTypeOrmEntity } from '../../src/donation/infrastructure/persistence/typeorm/donation-typeorm.entity';
import { ChapaClient } from '../../src/donation/infrastructure/services/chapa.client';
import {
  closeDBAfterTest,
  createDBEntities,
  resetDBBeforeTest,
} from '../test-utils';

describe('DonationController (e2e)', () => {
  let app: INestApplication;

  const chapaClientMock: Partial<jest.Mocked<ChapaClient>> = {
    initializeTransaction: jest.fn(),
    verifySignature: jest.fn(),
    verifyTransaction: jest.fn(),
  };

  beforeAll(async () => {
    await resetDBBeforeTest();
    await createDBEntities();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ChapaClient)
      .useValue(chapaClientMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('creates campaign, initializes donation, completes via webhook, and provides receipt', async () => {
    (chapaClientMock.initializeTransaction as jest.Mock).mockResolvedValue({
      checkoutUrl: 'https://checkout.test',
    });
    (chapaClientMock.verifySignature as jest.Mock).mockReturnValue(true);
    (chapaClientMock.verifyTransaction as jest.Mock).mockResolvedValue(true);

    const createCampaignResp = await request(app.getHttpServer())
      .post('/donations/campaigns')
      .send({
        disasterID: 'c84ed5b4-20f4-45d2-a8b1-2b739d5af4df',
        goalAmount: 100,
        currency: 'ETB',
        description: 'desc',
      })
      .expect(HttpStatus.CREATED);

    const campaignId = createCampaignResp.body.data.campaignID as string;

    await request(app.getHttpServer())
      .patch(`/donations/campaigns/${campaignId}/status`)
      .send({ status: 'ACTIVE' })
      .expect(HttpStatus.OK);

    const initializeResp = await request(app.getHttpServer())
      .post('/donations/initialize')
      .set('Idempotency-Key', 'idem-1')
      .send({
        campaignID: campaignId,
        amount: 10,
        currency: 'ETB',
        donor: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+251900000000',
          isAnonymous: true,
        },
      })
      .expect(HttpStatus.CREATED);

    expect(initializeResp.body.data.checkoutUrl).toBe('https://checkout.test');
    expect(initializeResp.body.data.donationId).toEqual(expect.any(String));
    expect(initializeResp.body.data.tx_ref).toEqual(expect.any(String));

    const donationId = initializeResp.body.data.donationId as string;
    const txRef = initializeResp.body.data.tx_ref as string;

    await request(app.getHttpServer())
      .post('/donations/webhooks/chapa')
      .set('Chapa-Signature', 'sig')
      .send({
        event: 'charge.success',
        status: 'success',
        tx_ref: txRef,
        reference: 'gw-1',
      })
      .expect(HttpStatus.OK);

    const statusResp = await request(app.getHttpServer())
      .get(`/donations/${donationId}/status`)
      .expect(HttpStatus.OK);

    expect(statusResp.body.data.status).toBe('COMPLETED');

    const conn = getConnection();
    const donationRow = await conn
      .getRepository(DonationTypeOrmEntity)
      .findOne({
        where: { transactionReference: txRef },
      });

    expect(donationRow?.receiptToken).toEqual(expect.any(String));

    await request(app.getHttpServer())
      .get(
        `/donations/${donationId}/receipt?token=${donationRow!.receiptToken}`,
      )
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/pdf/);
  });

  afterAll(async () => {
    await app.close();
    await closeDBAfterTest();
  });
});
