/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async() => {
     const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    pactum.request.setBaseUrl('http://localhost:3333')
  })

  afterAll(() => {
    app.close();
  })
  
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'fernando@gmail.com',
      password:'123'
     }
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      })
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      })
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      })
      it('should signup', () => {
          return pactum
            .spec()
            .post('/auth/signup')
            .withBody(dto)
            .expectStatus(201)
       })
    })

    describe('Login', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      })
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      })
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .expectStatus(400);
      })
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('user-token', 'access_token')
      })
    })
  })
  
  describe('User', () => {
    describe('Get user', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/user')
          .withHeaders({
            Authorization: 'Bearer $S{user-token}',
          })
          .expectStatus(200);
      });
    })

    describe('Edit user', () => {
      it('should get edit user', () => {
        const dto: EditUserDto = {
          firstName: "kelly",
          email: 'kelly457@hotmail.com'
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{user-token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    })
  })

  describe('Bookmarks', () => {

    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{user-token}',
          })
          .expectStatus(200)
          .expectBody([]);
      })
    })

    describe('Create Bookmarks', () => {
      const dto: CreateBookmarkDto = {
        title: "First Bookmark",
        link: "https://www.youtube.com/watch?v=BGTx91t8q50",
      }
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{user-token}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id')
      })
    })

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{user-token}',
          })
          .expectStatus(200)
          .expectJsonLength(1)
      })
    })

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{user-token}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      })
    })

    describe('Edit bookmark by id', () => {
      const dto:EditBookmarkDto = {
         title: 'Java Tutorial for Beginners 2023',
         description:'Learn Java programming from basics or you can say ZERO to HERO'
      }
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{user-token}',
          })
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      })
    })

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{user-token}',
          })
          .expectStatus(204);
      })

      it('should get empty bookmarks', () => {
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{user-token}',
        })
        .expectStatus(200)
        .expectJsonLength(0)
      })
    })
  })

});