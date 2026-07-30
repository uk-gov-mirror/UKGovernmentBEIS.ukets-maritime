import { AddressDTO, VerificationBodyCreationDTO, VerificationBodyDTO } from '@mrtm/api';

import { EmissionTradingSchemesEnum } from '@verification-bodies/types';

const mockAddress: AddressDTO = {
  postcode: '55-555',
  line1: 'TestLine1',
  country: 'PL',
  city: 'Jelenia Góra',
};

export const mockedVerificationBodyCreationDTO: VerificationBodyCreationDTO = {
  name: 'mockedName',
  accreditationReferenceNumber: 'mockedAccreditationReferenceNumber',
  accreditationBodyName: 'Accreditation body',
  emissionTradingSchemes: [EmissionTradingSchemesEnum.UKMRTM],
  address: mockAddress,
  adminVerifierUserInvitation: {
    firstName: 'firstName',
    lastName: 'lastName',
    phoneNumber: '111222333',
    email: 'test@email.com',
  },
};

export const mockedVerificationBodies: VerificationBodyDTO[] = [
  {
    id: 1,
    name: 'mockedName',
    accreditationBodyName: 'Accreditation body',
    accreditationReferenceNumber: 'mockedAccreditationReferenceNumber',
    emissionTradingSchemes: [EmissionTradingSchemesEnum.UKMRTM],
    address: mockAddress,
    status: 'ACTIVE',
  },
];
