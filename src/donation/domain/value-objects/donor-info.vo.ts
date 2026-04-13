export interface DonorInfoPrimitives {
  fullName: string;
  email: string;
  phoneNumber?: string;
  isAnonymous: boolean;
}

export class DonorInfo {
  constructor(
    private readonly fullName: string,
    private readonly email: string,
    private readonly phoneNumber: string | undefined,
    private readonly isAnonymous: boolean,
  ) {}

  public getFullName(): string {
    return this.fullName;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPhoneNumber(): string | undefined {
    return this.phoneNumber;
  }

  public getIsAnonymous(): boolean {
    return this.isAnonymous;
  }

  public toPrimitives(): DonorInfoPrimitives {
    return {
      fullName: this.fullName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      isAnonymous: this.isAnonymous,
    };
  }
}
