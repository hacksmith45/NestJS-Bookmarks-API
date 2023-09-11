/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('user')
  getUser(@GetUser() user: User) {
    return user; 
  }
  
  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto:EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
