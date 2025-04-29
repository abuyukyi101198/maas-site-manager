import type { BootAsset, Settings, SettingsUpdate, ValidationErrorResponseModel } from "@/api/client";

// TODO: replace with auto-generated type BootAsset when the missing fields are added
export type Image = BootAsset & {
  size: number;
  downloaded: number;
  is_custom_image: boolean;
};

// TODO: replace with auto-generated types from the API client https://warthogs.atlassian.net/browse/MAASENG-2569
export type UpstreamImage = Pick<Image, "id" | "release" | "arch" | "codename" | "size">;
export type UpstreamImageSource = {
  upstreamSource: string;
  keepUpdated: boolean;
  credentials: string;
};

// TODO: replace with actual Settings type
// once settings api is updated
// https://warthogs.atlassian.net/browse/MAASENG-2594
export type TSettings = Settings & { images_connect_to_maas: boolean };

// TODO: replace with actual SettingsPatchRequest type
// once settings api is updated
// https://warthogs.atlassian.net/browse/MAASENG-2594
export type TSettingsPatchRequest = SettingsUpdate & { images_connect_to_maas: boolean };

export type MutationErrorResponse = {
  body: ValidationErrorResponseModel;
};
