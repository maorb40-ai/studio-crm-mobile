import { EntityName } from '../types/entities';

export type ViewOnlyField = { key: string; label: string };

export type RootStackParamList = {
  Home: undefined;
  ClientsList: undefined;
  ClientDetail: { clientId: number };
  Tasks: undefined;
  Settings: undefined;
  ViewOnlyList: { entity: EntityName; title: string; fields: ViewOnlyField[] };
};
