import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

import { DonorInfo } from '../../domain/value-objects/donor-info.vo';

interface ChapaInitializeParams {
  txRef: string;
  amount: number;
  currency: string;
  donor: DonorInfo;
}

interface ChapaInitializeResponse {
  checkoutUrl: string;
}

@Injectable()
export class ChapaClient {
  constructor(private readonly configService: ConfigService) {}

  public async initializeTransaction(
    params: ChapaInitializeParams,
  ): Promise<ChapaInitializeResponse> {
    const apiUrl = `${this.getBaseUrl()}/transaction/initialize`;
    const donor = params.donor.toPrimitives();
    const [firstName, ...rest] = donor.fullName.trim().split(' ');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getSecretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount.toFixed(2),
        currency: params.currency,
        email: donor.email,
        first_name: firstName,
        last_name: rest.join(' ') || firstName,
        phone_number: donor.phoneNumber,
        tx_ref: params.txRef,
        callback_url: this.configService.get<string>('chapa.callbackUrl'),
        return_url: this.configService.get<string>('chapa.returnUrl'),
      }),
    });

    const payload = (await response.json()) as {
      status: string;
      message?: string;
      data?: { checkout_url?: string };
    };

    if (
      !response.ok ||
      payload.status !== 'success' ||
      !payload.data?.checkout_url
    ) {
      throw new Error(
        payload.message || 'Unable to initialize Chapa transaction',
      );
    }

    return { checkoutUrl: payload.data.checkout_url };
  }

  public async verifyTransaction(txRef: string): Promise<boolean> {
    const apiUrl = `${this.getBaseUrl()}/transaction/verify/${txRef}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.getSecretKey()}`,
      },
    });

    const payload = (await response.json()) as {
      status?: string;
      data?: { status?: string };
    };

    if (!response.ok || payload.status !== 'success') {
      return false;
    }

    return payload.data?.status === 'success';
  }

  public verifySignature(
    payload: Record<string, unknown>,
    signature: string,
  ): boolean {
    const secret = this.configService.get<string>('chapa.webhookSecret') || '';
    if (!secret || !signature) {
      return false;
    }

    const digest = createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const expected = Buffer.from(digest);
    const received = Buffer.from(signature);

    if (expected.length !== received.length) {
      return false;
    }

    return timingSafeEqual(expected, received);
  }

  private getBaseUrl(): string {
    return (
      this.configService.get<string>('chapa.baseUrl') ||
      'https://api.chapa.co/v1'
    );
  }

  private getSecretKey(): string {
    const secretKey = this.configService.get<string>('chapa.secretKey');
    if (!secretKey) {
      throw new Error('Missing Chapa secret key configuration');
    }

    return secretKey;
  }
}
