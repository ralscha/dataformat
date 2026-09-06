export interface Address {
  id: number;
  lastName: string;
  firstName: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  email: string;
  dob: Date | null;
}
