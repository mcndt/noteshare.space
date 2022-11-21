import {
  IsBase64,
  IsHexadecimal,
  IsNotEmpty,
  Matches,
  ValidateIf,
} from "class-validator";

abstract class NoteRequestBody {
  @ValidateIf((o) => o.user_id != null)
  @IsHexadecimal()
  user_id: string | undefined;

  @ValidateIf((o) => o.plugin_version != null)
  @Matches("^[0-9]+\\.[0-9]+\\.[0-9]+$")
  plugin_version: string | undefined;
}

export class NotePostRequest extends NoteRequestBody {
  @IsBase64()
  @IsNotEmpty()
  ciphertext: string | undefined;

  @IsBase64()
  @ValidateIf((o) => !o.iv)
  hmac?: string | undefined;

  @IsBase64()
  @ValidateIf((o) => !o.hmac)
  iv?: string | undefined;

  @Matches("^v[0-9]+$")
  crypto_version: string = "v1";
}

export class NoteDeleteRequest extends NoteRequestBody {
  @IsBase64()
  @IsNotEmpty()
  secret_token: string | undefined;
}
