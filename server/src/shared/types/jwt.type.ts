import { ObjectId } from 'mongodb'

export interface AccessTokenPayloadCreate {
  _id: string | ObjectId
  email: string
  name: string
  role: string
  sub?: string
  iss?: string
}

export interface AccessTokenPayload extends AccessTokenPayloadCreate {
  exp: number
  iat: number
}

export interface RefreshTokenPayloadCreate {
  _id: string | ObjectId
  email: string
  name: string
  role: string
  sub?: string
  iss?: string
}

export interface RefreshTokenPayload extends RefreshTokenPayloadCreate {
  exp: number
  iat: number
}
