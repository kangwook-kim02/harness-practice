-- =============================================
-- Enum 타입 정의
-- =============================================

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE listing_status AS ENUM ('active', 'inactive');

-- =============================================
-- profiles 테이블
-- =============================================

CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname   text NOT NULL,
  university text NOT NULL,
  verified   boolean NOT NULL DEFAULT false,
  role       user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 누구나 프로필 조회 가능
CREATE POLICY "profiles: anyone can read"
  ON profiles FOR SELECT
  USING (true);

-- 본인만 프로필 수정 가능
CREATE POLICY "profiles: owner can update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- student_verifications 테이블
-- =============================================

CREATE TABLE student_verifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_url text NOT NULL,
  status       verification_status NOT NULL DEFAULT 'pending',
  reviewed_by  uuid REFERENCES profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE student_verifications ENABLE ROW LEVEL SECURITY;

-- 본인만 자신의 인증 신청 조회 가능
CREATE POLICY "student_verifications: owner can read"
  ON student_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- 본인만 인증 신청 등록 가능
CREATE POLICY "student_verifications: owner can insert"
  ON student_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- listings 테이블
-- =============================================

CREATE TABLE listings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title                text NOT NULL,
  description          text NOT NULL,
  address              text NOT NULL,
  price_per_night      numeric NOT NULL,
  available_from       date NOT NULL,
  available_to         date NOT NULL,
  landlord_consent_url text NOT NULL,
  image_urls           text[] NOT NULL DEFAULT '{}',
  contact_info         text NOT NULL,
  status               listing_status NOT NULL DEFAULT 'active',
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- 검색 성능을 위한 인덱스
CREATE INDEX listings_price_per_night_idx ON listings (price_per_night);
CREATE INDEX listings_available_from_idx  ON listings (available_from);
CREATE INDEX listings_available_to_idx    ON listings (available_to);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- 누구나 active 매물 조회 가능
CREATE POLICY "listings: anyone can read active"
  ON listings FOR SELECT
  USING (status = 'active');

-- verified 사용자만 매물 등록 가능 (본인 user_id로만)
CREATE POLICY "listings: verified user can insert"
  ON listings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND verified = true
    )
  );

-- 소유자만 매물 수정 가능
CREATE POLICY "listings: owner can update"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

-- 소유자만 매물 삭제 가능
CREATE POLICY "listings: owner can delete"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 신규 사용자 자동 profiles 생성 trigger
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, university)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', ''),
    COALESCE(NEW.raw_user_meta_data->>'university', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
