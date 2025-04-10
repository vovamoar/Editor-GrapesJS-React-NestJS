import { NestFactory } from '@nestjs/core'
import * as express from 'express'
import * as path from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors()
  app.use('/static', express.static(path.join(__dirname, '../sites')))

  await app.listen(5001)
  console.log(`🚀 Backend running at http://localhost:5001`)
}
bootstrap();

