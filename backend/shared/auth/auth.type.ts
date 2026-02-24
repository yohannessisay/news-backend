export type AuthenticatedUser = {
  id: string;
  role: "author" | "reader";
};

export type JwtTokenPayload = {
  sub: string;
  role: "author" | "reader";
};
