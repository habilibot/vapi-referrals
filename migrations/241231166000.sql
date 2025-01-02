-- referrals
CREATE SCHEMA IF NOT EXISTS referrals;
GRANT USAGE
ON SCHEMA referrals
TO postgres, anon, authenticated, service_role, dashboard_user;

-- --Referral
CREATE TABLE referrals.referral (
    id SERIAL PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) NOT NULL,
    referred_id UUID REFERENCES auth.users(id),
    referred_username VARCHAR(100) DEFAULT NULL,
    referred_joined_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    referrer_rewarded BOOLEAN DEFAULT FALSE,
    referred_rewarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (referrer_id, referred_id)
);

CREATE POLICY "service_role_full_access"
ON referrals.referral
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY insert_referral ON referrals.referral FOR INSERT TO authenticated;

CREATE POLICY update_referral ON referrals.referral FOR UPDATE TO authenticated USING (
    auth.uid() = referrer_id
);

CREATE POLICY delete_referral ON referrals.referral FOR DELETE TO authenticated USING (
    auth.uid() = referrer_id
);

CREATE POLICY select_referral ON referrals.referral FOR SELECT TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA referrals
TO postgres, authenticated, service_role, dashboard_user, anon;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA referrals
TO postgres, authenticated, service_role, dashboard_user, anon;
