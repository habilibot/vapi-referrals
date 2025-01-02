import { createClient } from 'jsr:@supabase/supabase-js@2';
import { convertToReferral } from '../_dto/referral.ts';

export default async (req: Request) => {
  const headers = req.headers;
  const authorization = headers.get('Authorization');
  if (!authorization) {
    return new Response('Authorization header required', {
      headers: {'Content-Type': 'application/json'},
      status: 401,
    });
  }

  // setup shaple client
  const client = createClient(
    Deno.env.get('SHAPLE_URL') ?? '',
    Deno.env.get('SHAPLE_SERVICE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const jwt = authorization.split(' ')[1];
  const {
    data: { user },
  } = await client.auth.getUser(jwt);

  if (!user) {
    console.error('User not found in getGameContext');
    return new Response('Invalid auth user', {
      headers: {'Content-Type': 'application/json'},
      status: 401,
    });
  }

  const { referrerUserId, referredUsername } = await req.json();

  if (!referrerUserId) {
    return new Response('Missing refererUserId', {
      headers: {'Content-Type': 'application/json'},
      status: 400,
    });
  }

  // upsert referral
  const { data: referral, error } = await client
    .schema('referrals')
    .from('referral')
    .upsert(
      {
        referrer_id: referrerUserId,
        referred_id: user.id,
        referred_username: referredUsername ?? '',
        referred_joined_at: new Date(),
      },
      {
        onConflict: ['referrer_id', 'referred_id'],
      },
    )
    .select()
    .single();

  if (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {'Content-Type': 'application/json'},
      status: 500,
    });
  }

  return new Response(JSON.stringify(convertToReferral(referral)), {
    headers: {'Content-Type': 'application/json'},
  });
};
