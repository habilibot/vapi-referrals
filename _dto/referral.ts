export type Referral = {
  id: string;
  referredUserId: string;
  referredUserName: string;
  referredJoinedAt: Date;
  createdAt: Date;
};

export function convertToReferral(referral: any): Referral {
  return {
    id: referral.id,
    referredUserId: referral.referred_id,
    referredUserName: referral.referred_username,
    referredJoinedAt: referral.referred_joined_at,
    createdAt: referral.created_at,
  };
}
