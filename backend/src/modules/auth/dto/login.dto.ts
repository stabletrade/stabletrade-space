import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly walletAddress: string;

  @ApiProperty()
  // @IsArray()
  @IsNotEmpty()
  readonly signature: any;

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  readonly signData: any;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  publicKey?: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  networkType: number;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  refCode: string;
}

export class PostLoginResponse {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly refreshToken: string;
}

export class GetRefreshResponse {
  @ApiProperty()
  readonly accessToken: string;
}
