import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Account } from 'src/databases/entities/accounts.entity';
import { User } from 'src/databases/entities/user.entity';

export class AuthTokenOutput {
  @Expose()
  @ApiProperty()
  accessToken: string;

  @Expose()
  @ApiProperty()
  refreshToken: string;

  @Expose()
  @ApiProperty()
  user: User;
}
export class AuthTokenOutput2 {
  @Expose()
  @ApiProperty()
  accessToken: string;

  @Expose()
  @ApiProperty()
  refreshToken: string;
}
export class UserAccessTokenClaims {
  @Expose()
  id: string;
  @Expose()
  username: string;
  @Expose()
  role: string;
}

export class UserRefreshTokenClaims {
  id: number;
}

export class RefreshTokenInput {
  @IsNotEmpty()
  @ApiProperty()
  refreshToken: string;
}

export class saveTokenCodeDto {
  @IsNotEmpty()
  @ApiProperty()
  code: string;

  @IsNotEmpty()
  @ApiProperty()
  accessToken: string;

  @IsNotEmpty()
  @ApiProperty()
  refreshToken: string;
}
