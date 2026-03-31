import { PartialType } from '@nestjs/mapped-types';
import { CreateHoSoDoiTuongDTO } from './create-ho-so-doi-tuong.dto';

export class UpdateHoSoDoiTuongDTO extends PartialType(CreateHoSoDoiTuongDTO) {}
