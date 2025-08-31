// src/user-profile-image/dto/create-user-profile-image.dto.ts
export class CreateUserProfileImageDto {
    userId: number;
    imageUrl: string;
  }
  
  // src/user-profile-image/dto/update-user-profile-image.dto.ts
  export class UpdateUserProfileImageDto {
    imageUrl?: string;
  }