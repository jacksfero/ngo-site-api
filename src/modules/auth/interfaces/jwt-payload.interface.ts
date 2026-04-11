 

export interface JwtPayload {
   
  sub: number; // 👈 your custom name instead of 'sub'
  name: string;
   siteId: number;
  roles: string[];  
 
}


export interface RegisterCartUserResponse {
  success: true;
  message: string;
  data: {
    token: string;
    user: { id: number; username: string; email?: string; mobile?: string };
    
  };
}