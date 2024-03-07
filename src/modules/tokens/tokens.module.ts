import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { TokenModel } from '@modules/tokens/models/token.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        SequelizeModule.forFeature([ TokenModel ]),
        JwtModule.register({})
    ],
    providers: [ TokensService ],
    exports: [ TokensService ]
})
export class TokensModule {}
