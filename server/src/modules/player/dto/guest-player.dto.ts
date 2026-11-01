import { IsString, IsOptional, IsEnum, IsEmail, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGuestPlayerDto {
  @ApiProperty({ example: 'Rahul Sharma', description: 'Guest player name' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @ApiPropertyOptional({ example: '+919876543210', description: 'Mobile number (optional)' })
  @IsOptional()
  @IsString()
  @IsPhoneNumber(null, { message: 'Please provide a valid mobile number' })
  mobile?: string;

  @ApiPropertyOptional({ example: 'rahul.guest@example.com', description: 'Email address (optional)' })
  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    example: 'right_hand',
    description: 'Batting style',
    enum: ['right_hand', 'left_hand'],
  })
  @IsOptional()
  @IsString()
  battingStyle?: string;

  @ApiPropertyOptional({
    example: 'right_arm_fast',
    description: 'Bowling style',
    enum: ['right_arm_fast', 'left_arm_fast', 'right_arm_spin', 'left_arm_spin'],
  })
  @IsOptional()
  @IsString()
  bowlingStyle?: string;

  @ApiPropertyOptional({
    example: 'allrounder',
    description: 'Player role',
    enum: ['batsman', 'bowler', 'allrounder', 'wicketkeeper'],
  })
  @IsOptional()
  @IsEnum(['batsman', 'bowler', 'allrounder', 'wicketkeeper'], {
    message: 'Role must be one of: batsman, bowler, allrounder, wicketkeeper',
  })
  role?: string;

  @ApiPropertyOptional({
    example: { notes: 'Friend of regular player', temporary: true },
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateGuestPlayerDto {
  @ApiPropertyOptional({ example: 'Rahul Kumar Sharma', description: 'Updated name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '+919876543211' })
  @IsOptional()
  @IsString()
  @IsPhoneNumber(null)
  mobile?: string;

  @ApiPropertyOptional({ example: 'rahul.updated@example.com' })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  battingStyle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bowlingStyle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['batsman', 'bowler', 'allrounder', 'wicketkeeper'])
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ConvertGuestPlayerDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'Email to use for the new regular player account',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'Password for the new account',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiPropertyOptional({
    example: '+919876543210',
    description: 'Mobile number (optional)',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber(null)
  mobile?: string;
}
