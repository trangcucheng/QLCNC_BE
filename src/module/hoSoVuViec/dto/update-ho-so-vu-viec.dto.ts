import { PartialType } from '@nestjs/mapped-types';
import { CreateHoSoVuViecDTO } from './create-ho-so-vu-viec.dto';

export class UpdateHoSoVuViecDTO extends PartialType(CreateHoSoVuViecDTO) {}
