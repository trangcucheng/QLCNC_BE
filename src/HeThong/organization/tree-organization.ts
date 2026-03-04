export class TreeOrganization {
  id: number;
  key: number;
  organizationCode: string;
  organizationName: string;
  organizationTypeID: number;
  organizationLevelID: number;
  organizationDescription: string;
  organizationAddress: string;
  organizationParent: number;
  organizationLevelName: string;
  organizationTypeName: string;
  label: string;
  parentName: string;
  typeUser: string;
  type: number;
  children: TreeOrganization[];
}
