import { JwtPayload } from "jwt-decode";

export interface JwtPayloadProps extends JwtPayload {
  csrf?: string
}