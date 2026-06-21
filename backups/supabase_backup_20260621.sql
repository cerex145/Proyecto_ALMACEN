--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: actas_recepcion_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actas_recepcion_detalles (
    id integer NOT NULL,
    acta_id integer NOT NULL,
    producto_id integer NOT NULL,
    producto_codigo character varying(100),
    producto_nombre character varying(255),
    fabricante character varying(200),
    lote_numero character varying(100) NOT NULL,
    fecha_vencimiento date,
    um character varying(50),
    temperatura_min numeric(5,2),
    temperatura_max numeric(5,2),
    cantidad_solicitada numeric(12,2) DEFAULT 0 NOT NULL,
    cantidad_recibida numeric(12,2) DEFAULT 0 NOT NULL,
    cantidad_bultos numeric(12,2) DEFAULT 0,
    cantidad_cajas numeric(12,2) DEFAULT 0,
    cantidad_por_caja numeric(12,2) DEFAULT 0,
    cantidad_fraccion numeric(12,2) DEFAULT 0,
    aspecto character varying(10) DEFAULT 'EMB'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.actas_recepcion_detalles OWNER TO postgres;

--
-- Name: acta_recepcion_detalles; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.acta_recepcion_detalles AS
 SELECT id,
    acta_id AS acta_recepcion_id,
    producto_id,
    producto_codigo,
    producto_nombre,
    fabricante,
    lote_numero,
    fecha_vencimiento,
    um,
    temperatura_min,
    temperatura_max,
    cantidad_solicitada,
    cantidad_recibida,
    cantidad_bultos,
    cantidad_cajas,
    cantidad_por_caja,
    cantidad_fraccion,
    aspecto,
    observaciones,
    created_at
   FROM public.actas_recepcion_detalles;


ALTER VIEW public.acta_recepcion_detalles OWNER TO postgres;

--
-- Name: actas_recepcion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actas_recepcion (
    id integer NOT NULL,
    fecha date NOT NULL,
    tipo_documento character varying(100),
    numero_documento character varying(100),
    cliente_id integer NOT NULL,
    proveedor character varying(255),
    tipo_operacion character varying(50),
    tipo_conteo character varying(100),
    condicion_temperatura character varying(100),
    observaciones text,
    responsable_recepcion character varying(255),
    responsable_entrega character varying(255),
    jefe_almacen character varying(255),
    estado character varying(20) DEFAULT 'activa'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.actas_recepcion OWNER TO postgres;

--
-- Name: actas_recepcion_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.actas_recepcion_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actas_recepcion_detalles_id_seq OWNER TO postgres;

--
-- Name: actas_recepcion_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.actas_recepcion_detalles_id_seq OWNED BY public.actas_recepcion_detalles.id;


--
-- Name: actas_recepcion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.actas_recepcion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actas_recepcion_id_seq OWNER TO postgres;

--
-- Name: actas_recepcion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.actas_recepcion_id_seq OWNED BY public.actas_recepcion.id;


--
-- Name: ajustes_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ajustes_stock (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    motivo character varying(300) NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ajustes_stock OWNER TO postgres;

--
-- Name: ajustes_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ajustes_stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ajustes_stock_id_seq OWNER TO postgres;

--
-- Name: ajustes_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ajustes_stock_id_seq OWNED BY public.ajustes_stock.id;


--
-- Name: alertas_vencimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alertas_vencimiento (
    id integer NOT NULL,
    lote_id integer,
    producto_id integer NOT NULL,
    lote_numero character varying(100) NOT NULL,
    fecha_vencimiento date NOT NULL,
    estado character varying(50) DEFAULT 'VIGENTE'::character varying NOT NULL,
    dias_faltantes integer,
    leida smallint DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    dias_para_vencer integer,
    cantidad integer DEFAULT 0
);


ALTER TABLE public.alertas_vencimiento OWNER TO postgres;

--
-- Name: alertas_vencimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alertas_vencimiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alertas_vencimiento_id_seq OWNER TO postgres;

--
-- Name: alertas_vencimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alertas_vencimiento_id_seq OWNED BY public.alertas_vencimiento.id;


--
-- Name: auditorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditorias (
    id integer NOT NULL,
    usuario_id integer,
    accion character varying(100) NOT NULL,
    tabla_afectada character varying(100) NOT NULL,
    registro_id integer,
    valores_anteriores jsonb,
    valores_nuevos jsonb,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.auditorias OWNER TO postgres;

--
-- Name: auditorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditorias_id_seq OWNER TO postgres;

--
-- Name: auditorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditorias_id_seq OWNED BY public.auditorias.id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    codigo character varying(50) NOT NULL,
    razon_social character varying(200) NOT NULL,
    cuit character varying(13),
    direccion character varying(300),
    distrito character varying(100),
    provincia character varying(100),
    departamento character varying(100),
    categoria_riesgo character varying(50),
    estado character varying(50) DEFAULT 'Activo'::character varying NOT NULL,
    telefono character varying(50),
    email character varying(100),
    activo smallint DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    persona_contacto character varying(200)
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: kardex; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kardex (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    lote_numero character varying(100),
    tipo_movimiento character varying(50) NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    saldo numeric(10,2) NOT NULL,
    documento_tipo character varying(50),
    documento_numero character varying(50),
    referencia_id integer,
    observaciones text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.kardex OWNER TO postgres;

--
-- Name: kardex_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kardex_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kardex_id_seq OWNER TO postgres;

--
-- Name: kardex_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kardex_id_seq OWNED BY public.kardex.id;


--
-- Name: lotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lotes (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    numero_lote character varying(100) NOT NULL,
    fecha_vencimiento date,
    cantidad_ingresada numeric(10,2) DEFAULT 0 NOT NULL,
    cantidad_disponible numeric(10,2) DEFAULT 0 NOT NULL,
    nota_ingreso_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cantidad_inicial numeric(10,2),
    cantidad_actual numeric(10,2),
    estado character varying(20) DEFAULT 'ACTIVO'::character varying
);


ALTER TABLE public.lotes OWNER TO postgres;

--
-- Name: lotes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lotes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lotes_id_seq OWNER TO postgres;

--
-- Name: lotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lotes_id_seq OWNED BY public.lotes.id;


--
-- Name: nota_ingreso_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_ingreso_detalles (
    id integer NOT NULL,
    nota_ingreso_id integer NOT NULL,
    producto_id integer NOT NULL,
    lote_numero character varying(100) NOT NULL,
    fecha_vencimiento date,
    um character varying(50),
    fabricante character varying(200),
    temperatura_min_c numeric(5,2),
    temperatura_max_c numeric(5,2),
    cantidad numeric(10,2) NOT NULL,
    precio_unitario numeric(10,2),
    cantidad_bultos numeric(10,2) DEFAULT 0,
    cantidad_cajas numeric(10,2) DEFAULT 0,
    cantidad_por_caja numeric(10,2) DEFAULT 0,
    cantidad_fraccion numeric(10,2) DEFAULT 0,
    cantidad_total numeric(10,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nota_ingreso_detalles OWNER TO postgres;

--
-- Name: nota_ingreso_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_ingreso_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nota_ingreso_detalles_id_seq OWNER TO postgres;

--
-- Name: nota_ingreso_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_ingreso_detalles_id_seq OWNED BY public.nota_ingreso_detalles.id;


--
-- Name: nota_salida_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_salida_detalles (
    id integer NOT NULL,
    nota_salida_id integer NOT NULL,
    producto_id integer NOT NULL,
    lote_id integer,
    cantidad numeric(10,2) NOT NULL,
    precio_unitario numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cant_bulto numeric(10,2) DEFAULT 0,
    cant_caja numeric(10,2) DEFAULT 0,
    cant_x_caja numeric(10,2) DEFAULT 0,
    cant_fraccion numeric(10,2) DEFAULT 0,
    lote_numero character varying(100),
    fecha_vencimiento date,
    um character varying(50),
    fabricante character varying(200),
    temperatura_min_c numeric(5,2),
    temperatura_max_c numeric(5,2),
    cantidad_total numeric(10,2)
);


ALTER TABLE public.nota_salida_detalles OWNER TO postgres;

--
-- Name: nota_salida_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_salida_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nota_salida_detalles_id_seq OWNER TO postgres;

--
-- Name: nota_salida_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_salida_detalles_id_seq OWNED BY public.nota_salida_detalles.id;


--
-- Name: notas_ingreso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notas_ingreso (
    id integer NOT NULL,
    numero_ingreso character varying(50) NOT NULL,
    fecha date NOT NULL,
    proveedor character varying(200) NOT NULL,
    tipo_documento character varying(100),
    numero_documento character varying(100),
    responsable_id integer,
    estado character varying(50) DEFAULT 'REGISTRADA'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cliente_id integer,
    numero_guia character varying(20),
    cliente_ruc character varying(20)
);


ALTER TABLE public.notas_ingreso OWNER TO postgres;

--
-- Name: notas_ingreso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notas_ingreso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notas_ingreso_id_seq OWNER TO postgres;

--
-- Name: notas_ingreso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notas_ingreso_id_seq OWNED BY public.notas_ingreso.id;


--
-- Name: notas_salida; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notas_salida (
    id integer NOT NULL,
    numero_salida character varying(50) NOT NULL,
    cliente_id integer,
    fecha date NOT NULL,
    tipo_documento character varying(50),
    numero_documento character varying(100),
    fecha_ingreso date,
    motivo_salida text,
    responsable_id integer,
    estado character varying(50) DEFAULT 'REGISTRADA'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cliente_ruc character varying(20)
);


ALTER TABLE public.notas_salida OWNER TO postgres;

--
-- Name: notas_salida_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notas_salida_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notas_salida_id_seq OWNER TO postgres;

--
-- Name: notas_salida_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notas_salida_id_seq OWNED BY public.notas_salida.id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    codigo character varying(50) NOT NULL,
    descripcion character varying(300) NOT NULL,
    proveedor character varying(200),
    tipo_documento character varying(100),
    numero_documento character varying(100),
    registro_sanitario character varying(100),
    lote character varying(100),
    fabricante character varying(200),
    categoria_ingreso character varying(50),
    procedencia character varying(200),
    unidad character varying(20) DEFAULT 'UND'::character varying NOT NULL,
    unidad_otro character varying(50),
    um character varying(20),
    temperatura_min_c numeric(6,2),
    temperatura_max_c numeric(6,2),
    observaciones text,
    activo smallint DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_documento date,
    unidad_medida character varying(50),
    cliente_id integer,
    proveedor_ruc character varying(20),
    cliente_ruc character varying(20)
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_seq OWNER TO postgres;

--
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    permisos jsonb DEFAULT '{}'::jsonb NOT NULL,
    activo smallint DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(200) NOT NULL,
    usuario character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    rol_id integer NOT NULL,
    activo smallint DEFAULT 1 NOT NULL,
    ultimo_acceso timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: actas_recepcion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actas_recepcion ALTER COLUMN id SET DEFAULT nextval('public.actas_recepcion_id_seq'::regclass);


--
-- Name: actas_recepcion_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actas_recepcion_detalles ALTER COLUMN id SET DEFAULT nextval('public.actas_recepcion_detalles_id_seq'::regclass);


--
-- Name: ajustes_stock id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_stock ALTER COLUMN id SET DEFAULT nextval('public.ajustes_stock_id_seq'::regclass);


--
-- Name: alertas_vencimiento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas_vencimiento ALTER COLUMN id SET DEFAULT nextval('public.alertas_vencimiento_id_seq'::regclass);


--
-- Name: auditorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditorias ALTER COLUMN id SET DEFAULT nextval('public.auditorias_id_seq'::regclass);


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: kardex id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kardex ALTER COLUMN id SET DEFAULT nextval('public.kardex_id_seq'::regclass);


--
-- Name: lotes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lotes ALTER COLUMN id SET DEFAULT nextval('public.lotes_id_seq'::regclass);


--
-- Name: nota_ingreso_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_ingreso_detalles ALTER COLUMN id SET DEFAULT nextval('public.nota_ingreso_detalles_id_seq'::regclass);


--
-- Name: nota_salida_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_salida_detalles ALTER COLUMN id SET DEFAULT nextval('public.nota_salida_detalles_id_seq'::regclass);


--
-- Name: notas_ingreso id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_ingreso ALTER COLUMN id SET DEFAULT nextval('public.notas_ingreso_id_seq'::regclass);


--
-- Name: notas_salida id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_salida ALTER COLUMN id SET DEFAULT nextval('public.notas_salida_id_seq'::regclass);


--
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: actas_recepcion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actas_recepcion (id, fecha, tipo_documento, numero_documento, cliente_id, proveedor, tipo_operacion, tipo_conteo, condicion_temperatura, observaciones, responsable_recepcion, responsable_entrega, jefe_almacen, estado, created_at, updated_at) FROM stdin;
1	2026-05-19	Guía de Remisión Remitente	T001-00003967	2	AFECORP PERU S.A.C	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-05-27 20:46:49.148055	2026-05-27 20:46:49.148055
2	2026-05-19	Guía de Remisión Remitente	T001-00003967	2	AFECORP PERU S.A.C	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-05-27 20:48:38.169159	2026-05-27 20:48:38.169159
3	2026-05-19	Guía de Remisión Remitente	T001-00003967	2	AFECORP PERU S.A.C	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-05-28 22:50:39.764869	2026-05-28 22:50:39.764869
4	2026-05-19	Guía de Remisión Remitente	T001-00003967	2	AFECORP PERU S.A.C	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-05-29 19:10:33.559824	2026-05-29 19:10:33.559824
5	2026-03-27	Guía de Remisión Remitente	T001-00007002	7	LINEAGE	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-01 21:10:07.168246	2026-06-01 21:10:07.168246
6	2026-04-24	Guía de Remisión Remitente	T004-00000698	7	LINEAGE	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-01 21:13:21.853223	2026-06-01 21:13:21.853223
7	2026-04-28	Guía de Remisión Remitente	T004-00000752	7	LINEAGE	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-01 21:28:37.420004	2026-06-01 21:28:37.420004
8	2026-05-05	Guía de Remisión Remitente	T004-00000794	7	LINEAGE	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-01 22:02:15.837717	2026-06-01 22:02:15.837717
9	2026-05-26	Guía de Remisión Remitente	T001-00075176	7	LINEAGE	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-02 15:22:44.195472	2026-06-02 15:22:44.195472
10	2026-05-26	Guía de Remisión Remitente	T004-00001024	7	LINEAGE	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-02 15:41:43.071215	2026-06-02 15:41:43.071215
11	2026-05-26	Guía de Remisión Remitente	TL01-00027928	2	AFECORP PERU S.A.C	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-02 17:47:21.595308	2026-06-02 17:47:21.595308
12	2026-05-26	Guía de Remisión Remitente	TM01-00019251	2	AFECORP PERU S.A.C	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-08 21:47:31.58424	2026-06-08 21:47:31.58424
13	2026-05-26	Guía de Remisión Remitente	TM01-00019251	2	AFECORP PERU S.A.C	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-09 15:21:37.550751	2026-06-09 15:21:37.550751
14	2026-05-26	Guía de Remisión Remitente	TM01-00019251	2	AFECORP PERU S.A.C	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 14:37:20.308183	2026-06-10 14:37:20.308183
15	2026-05-26	Guía de Remisión Remitente	TL01-00027928	2	AFECORP PERU S.A.C	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 15:31:59.732514	2026-06-10 15:31:59.732514
16	2026-04-20	Guía de Remisión Remitente	T001-00000030	9	JR MEDIC E.I.R.L.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 15:33:11.505082	2026-06-10 15:33:11.505082
17	2026-04-23	Guía de Remisión Remitente	T001-00003311	9	JR MEDIC E.I.R.L.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 16:45:59.202389	2026-06-10 16:45:59.202389
18	2026-04-24	Guía de Remisión Remitente	T001-19881	9	JR MEDIC E.I.R.L.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 17:30:44.136607	2026-06-10 17:30:44.136607
19	2026-05-04	Guía de Remisión Remitente	T001-00011722	9	JR MEDIC E.I.R.L.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 18:00:03.309488	2026-06-10 18:00:03.309488
20	2026-05-06	Guía de Remisión Remitente	T001-003456	9	EDVAMEDICAL E.I.R.L	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 20:10:59.627753	2026-06-10 20:10:59.627753
21	2026-05-11	Guía de Remisión Remitente	T001-00011819	9	CIA IMPORTADORA AMERICANA S.A.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 20:15:12.011694	2026-06-10 20:15:12.011694
22	2026-05-12	Guía de Remisión Remitente	T001-00074329	9	ALCIMAR'S MEDIC S.A.C.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 20:25:54.32242	2026-06-10 20:25:54.32242
23	2026-05-12	Guía de Remisión Remitente	T001-00003398	9	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 20:35:42.294128	2026-06-10 20:35:42.294128
24	2026-05-15	Guía de Remisión Remitente	TG01-007443	9	MONT GROUP SAC	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 20:53:23.536304	2026-06-10 20:53:23.536304
25	2026-05-13	Guía de Remisión Remitente	T001-00046280	9	DIAGNOSTICA PERUANA S.A.C.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 21:07:59.004318	2026-06-10 21:07:59.004318
26	2026-05-14	Guía de Remisión Remitente	T001-00003503	9	EDVAMEDICAL E.I.R.L	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 21:20:05.100122	2026-06-10 21:20:05.100122
27	2026-05-04	Guía de Remisión Remitente	T001-00011722	9	CIA. IMPORTADORA AMERICANA S.A.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 21:23:24.282969	2026-06-10 21:23:24.282969
28	2026-04-24	Guía de Remisión Remitente	T001-19881	9	RAPIDIAGNOSTICS S.A.C.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 21:23:50.920519	2026-06-10 21:23:50.920519
29	2026-04-23	Guía de Remisión Remitente	T001-00003311	9	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 21:24:15.977815	2026-06-10 21:24:15.977815
30	2026-05-14	Guía de Remisión Remitente	TTT2-003176	9	CORPORACION LYACOS E.I.R.L	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 21:35:38.18114	2026-06-10 21:35:38.18114
31	2026-05-19	Guía de Remisión Remitente	T001-00003967	2	JOSSON MEDICAL EIRL	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-10 21:43:16.72111	2026-06-10 21:43:16.72111
32	2026-05-14	Guía de Remisión Remitente	T025-0003071	9	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-11 15:24:25.149947	2026-06-11 15:24:25.149947
33	2026-05-14	Guía de Remisión Remitente	T025-0003071	9	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-11 15:33:13.945726	2026-06-11 15:33:13.945726
34	2026-05-15	Guía de Remisión Remitente	T001-00000044	9	A. TARRILLO SA.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-11 15:57:41.99996	2026-06-11 15:57:41.99996
35	2026-05-15	Guía de Remisión Remitente	T001-00000045	9	DROGUERIA IMPORTADORA ANTONIO´S E.I.R.L.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-11 19:52:35.080693	2026-06-11 19:52:35.080693
36	2026-05-21	Guía de Remisión Remitente	EG07-00001989	9	BIOMEDICAL CARE SYSTEMS S.A.C.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-11 20:07:51.88172	2026-06-11 20:07:51.88172
37	2026-05-21	Guía de Remisión Remitente	T004-00000108	9	GRUPO PALMISTA S.A.C.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-11 20:13:55.240151	2026-06-11 20:13:55.240151
38	2026-05-15	Guía de Remisión Remitente	T001-00000044	9	A. TARRILLO SA.	Compra Local	Conteo al 100%	\N	Documento: 00000033	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-11 21:42:24.932793	2026-06-11 21:42:24.932793
39	2026-06-08	Guía de Remisión Remitente	T001-23348	14	SEVEN PHARMA	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 15:47:54.474689	2026-06-18 15:47:54.474689
40	2026-06-17	Guía de Remisión Remitente	T104-00001426	14	H REPS S.A.C.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 16:22:29.94769	2026-06-18 16:22:29.94769
41	2026-06-06	Invoice	PE0063220260515A	3	MIRET MEDICAL ASOCIADOS S.A.C. MIRET MED	Importación	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 19:18:06.420081	2026-06-18 19:18:06.420081
42	2026-06-06	Invoice	PE0063220260515A	3	BROSMED MEDICAL CO., LTD.	Importación	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 19:29:02.146182	2026-06-18 19:29:02.146182
43	2026-05-12	Guía de Remisión Remitente	T002-3068	3	MERIL LIFE SCIENCES PVT LTD.	Devolución	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 20:08:47.963948	2026-06-18 20:08:47.963948
44	2026-05-28	Guía de Remisión Remitente	EG07 - 00000075	3	AFECORP PERU S.A.C.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 20:24:14.143588	2026-06-18 20:24:14.143588
45	2026-06-01	Guía de Remisión Remitente	T002-3172	3	MERIL LIFE SCIENCES PVT LTD.	Devolución	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 20:38:05.927255	2026-06-18 20:38:05.927255
46	2026-06-02	Guía de Remisión Remitente	T002-3168	3	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	Devolución	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 20:48:08.260761	2026-06-18 20:48:08.260761
47	2026-06-02	Guía de Remisión Remitente	T006-00007287	3	CARDIOMED S.A.C.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 21:17:54.844441	2026-06-18 21:17:54.844441
48	2026-06-03	Guía de Remisión Remitente	T002-3162	3	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	Devolución	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 21:28:29.146997	2026-06-18 21:28:29.146997
49	2026-06-03	Guía de Remisión Remitente	T002-3176	3	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	Devolución	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 21:37:38.165649	2026-06-18 21:37:38.165649
50	2026-06-05	Guía de Remisión Remitente	T001-00009595	3	MULTI MED PERU S.A.C.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 21:45:59.940134	2026-06-18 21:45:59.940134
51	2026-06-05	Guía de Remisión Remitente	T002-3191	3	MERIL LIFE SCIENCES PVT LTD.	Devolución	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-18 21:57:33.436258	2026-06-18 21:57:33.436258
52	2026-06-12	Guía de Remisión Remitente	T002-3234	3	MERIL LIFE SCIENCES PVT LTD.	Devolución	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-19 16:28:10.791129	2026-06-19 16:28:10.791129
53	2026-06-12	Guía de Remisión Remitente	T002-2855	3	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	Devolución	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-19 17:21:54.89738	2026-06-19 17:21:54.89738
54	2026-06-08	Guía de Remisión Remitente	TA01-0004136	3	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-19 17:39:27.865242	2026-06-19 17:39:27.865242
55	2026-06-12	Guía de Remisión Remitente	T002-4814	3	BROSMED MEDICAL CO.,LTD.	Compra Local	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-19 17:52:21.275826	2026-06-19 17:52:21.275826
56	2026-06-16	Guía de Remisión Remitente	T002-3246	3	AFECORP PERU S.A.C.	Devolución	Conteo al 100%	\N	\N	ROGER E. BLANCAS RAMOS	\N	JANETH T. NARVAEZ HUAMANI	activa	2026-06-19 18:03:04.346743	2026-06-19 18:03:04.346743
\.


--
-- Data for Name: actas_recepcion_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actas_recepcion_detalles (id, acta_id, producto_id, producto_codigo, producto_nombre, fabricante, lote_numero, fecha_vencimiento, um, temperatura_min, temperatura_max, cantidad_solicitada, cantidad_recibida, cantidad_bultos, cantidad_cajas, cantidad_por_caja, cantidad_fraccion, aspecto, observaciones, created_at) FROM stdin;
1	1	9	11510002	CATÉTER PARA DIAGNÓSTICO CORONARIO CURVA \r\nJUDKINS JR4 DE 5 FRENCH	JOSSON MEDICAL EIRL	SP1125121506	2028-12-23	UND	15.00	25.00	20.00	20.00	1.00	1.00	20.00	0.00	EMB	\N	2026-05-27 20:46:49.166824
2	1	5	53610009	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA TIPO JUDKINS DERECHA JR4 DE 6 FRENCH X 100 CCM	JOSSON MEDICAL EIRL	SP5324121808	2027-12-18	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-05-27 20:46:49.182
3	1	45	bm-bid-i30	JERINGA DE ALTA PRESIÓN CON MANÓMETRO DE 20 CC -\r\nBROSMED X 01 UND.	JOSSON MEDICAL EIRL	2511114218	2028-11-10	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-05-27 20:46:49.192754
4	1	46	bm-hv01	Y CONNECTOR SETS  X  01 UND.	JOSSON MEDICAL EIRL	2506106166	2028-06-09	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-05-27 20:46:49.204244
5	1	4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	JOSSON MEDICAL EIRL	SP5325022829	2028-03-02	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-05-27 20:46:49.224634
6	1	4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	JOSSON MEDICAL EIRL	SP5325082210	2028-08-23	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-05-27 20:46:49.235109
7	2	9	11510002	CATÉTER PARA DIAGNÓSTICO CORONARIO CURVA \r\nJUDKINS JR4 DE 5 FRENCH	JOSSON MEDICAL EIRL	SP1125121506	2028-12-23	UND	15.00	25.00	20.00	20.00	1.00	1.00	20.00	0.00	EMB	\N	2026-05-27 20:48:38.176367
8	2	5	53610009	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA TIPO JUDKINS DERECHA JR4 DE 6 FRENCH X 100 CCM	JOSSON MEDICAL EIRL	SP5324121808	2027-12-18	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-05-27 20:48:38.182042
9	2	45	bm-bid-i30	JERINGA DE ALTA PRESIÓN CON MANÓMETRO DE 20 CC -\r\nBROSMED X 01 UND.	JOSSON MEDICAL EIRL	2511114218	2028-11-10	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-05-27 20:48:38.187147
10	2	46	bm-hv01	Y CONNECTOR SETS  X  01 UND.	JOSSON MEDICAL EIRL	2506106166	2028-06-09	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-05-27 20:48:38.192517
11	2	4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	JOSSON MEDICAL EIRL	SP5325022829	2028-03-02	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-05-27 20:48:38.197729
12	2	4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	JOSSON MEDICAL EIRL	SP5325082210	2028-08-23	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-05-27 20:48:38.22442
13	3	9	11510002	CATÉTER PARA DIAGNÓSTICO CORONARIO CURVA \r\nJUDKINS JR4 DE 5 FRENCH	JOSSON MEDICAL EIRL	SP1125121506	2028-12-23	UND	15.00	25.00	20.00	20.00	1.00	1.00	20.00	0.00	EMB	\N	2026-05-28 22:50:39.829743
14	3	5	53610009	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA TIPO JUDKINS DERECHA JR4 DE 6 FRENCH X 100 CCM	JOSSON MEDICAL EIRL	SP5324121808	2027-12-18	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-05-28 22:50:39.841281
15	3	45	bm-bid-i30	JERINGA DE ALTA PRESIÓN CON MANÓMETRO DE 20 CC -\r\nBROSMED X 01 UND.	JOSSON MEDICAL EIRL	2511114218	2028-11-10	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-05-28 22:50:39.847655
16	3	46	bm-hv01	Y CONNECTOR SETS  X  01 UND.	JOSSON MEDICAL EIRL	2506106166	2028-06-09	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-05-28 22:50:39.854614
17	3	4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	JOSSON MEDICAL EIRL	SP5325022829	2028-03-02	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-05-28 22:50:39.861879
18	3	4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	JOSSON MEDICAL EIRL	SP5325082210	2028-08-23	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-05-28 22:50:39.867311
19	4	9	11510002	CATÉTER PARA DIAGNÓSTICO CORONARIO CURVA \r\nJUDKINS JR4 DE 5 FRENCH	JOSSON MEDICAL EIRL	SP1125121506	2028-12-23	UND	15.00	25.00	20.00	20.00	1.00	1.00	20.00	0.00	EMB	\N	2026-05-29 19:10:33.629704
20	4	5	53610009	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA TIPO JUDKINS DERECHA JR4 DE 6 FRENCH X 100 CCM	JOSSON MEDICAL EIRL	SP5324121808	2027-12-18	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-05-29 19:10:33.643697
21	4	45	bm-bid-i30	JERINGA DE ALTA PRESIÓN CON MANÓMETRO DE 20 CC -\r\nBROSMED X 01 UND.	JOSSON MEDICAL EIRL	2511114218	2028-11-10	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-05-29 19:10:33.65069
22	4	46	bm-hv01	Y CONNECTOR SETS  X  01 UND.	JOSSON MEDICAL EIRL	2506106166	2028-06-09	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-05-29 19:10:33.65806
23	4	4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	JOSSON MEDICAL EIRL	SP5325022829	2028-03-02	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-05-29 19:10:33.663999
24	4	4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	JOSSON MEDICAL EIRL	SP5325082210	2028-08-23	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-05-29 19:10:33.671696
25	5	574	84020004	LANCETAS RETRACTIL ESTERIL 0.8MMX 2.0MM CAJA X 200	JAMPAR S.A.C.	F22B123C2	2029-12-03	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-01 21:10:07.185749
26	6	575	dil0014	DILUYENTE DIL-C  X 20 LT	LC BIOCORP S.A.C.	2025111701	2027-11-16	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-01 21:13:21.952204
27	6	576	lyc0001	LISANTE LYC-1 X 200 ML	LC BIOCORP S.A.C.	2025090101	2027-08-31	UND	15.00	25.00	4.00	4.00	1.00	1.00	4.00	0.00	EMB	\N	2026-06-01 21:13:21.980679
28	6	577	lyc0002	LISANTE LYC-2 X 500 ML	LC BIOCORP S.A.C.	2025112201	2027-11-21	UND	15.00	25.00	4.00	4.00	1.00	1.00	4.00	0.00	EMB	\N	2026-06-01 21:13:21.993394
29	7	578	DIL0014	DILUYENTE DIL-C  X 20 LT	LC BIOCORP S.A.C.	2025111701	2027-11-16	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-01 21:28:37.431416
30	8	579	DIL0014	DILUYENTE DIL-C  X 20 LT	LC BIOCORP S.A.C.	2024101702	2026-10-16	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-01 22:02:15.857826
31	9	580	AGU8556	AGUJA DESCARTABLE 21G X 1 1/2 X 100	ALCIMAR´S MEDIC S.A.C.	20251212	2030-11-30	UND	15.00	25.00	25.00	25.00	1.00	1.00	25.00	0.00	EMB	\N	2026-06-02 15:22:44.219418
32	10	582	DIL0014	DILUYENTE DIL-C  X 20 LT	LC BIOCORP S.A.C.	2025121802	2027-12-17	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-02 15:41:43.08124
33	11	42	iq35f180j3	GUIA INQWIRE 3mm J 0.035” 180 X 01 UND.	CARDIO PERFUSION E.I.R.L	K3371732	2028-10-24	UND	15.00	25.00	10.00	10.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-02 17:47:21.609366
34	11	43	iq35f260j3	GUIA INQWIRE 3mm J 0.035” 260 X 01 UND.	CARDIO PERFUSION E.I.R.L	K3396584	2028-11-22	UND	15.00	25.00	20.00	20.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-02 17:47:21.617145
35	12	583	1009660J	GUIA CORONARIA 014 BMW UNIVERSAL I 190CM	CARDIO PERFUSION E.I.R.L	4100272	2026-09-30	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-08 21:47:31.615293
36	12	584	7523-21	CATETER PERFORMA JUDKINS 5F JR 4.0 100CM	CARDIO PERFUSION E.I.R.L	I3455577	2029-02-26	UND	15.00	25.00	8.00	8.00	1.00	1.00	8.00	0.00	EMB	\N	2026-06-08 21:47:31.632411
37	13	583	1009660J	GUIA CORONARIA 014 BMW UNIVERSAL I 190CM	CARDIO PERFUSION E.I.R.L	4100272	2026-09-30	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-09 15:21:37.636269
38	13	584	7523-21	CATETER PERFORMA JUDKINS 5F JR 4.0 100CM	CARDIO PERFUSION E.I.R.L	I3455577	2029-02-26	UND	15.00	25.00	8.00	8.00	1.00	1.00	8.00	0.00	EMB	\N	2026-06-09 15:21:37.645585
39	14	583	1009660J	GUIA CORONARIA 014 BMW UNIVERSAL I 190CM	CARDIO PERFUSION E.I.R.L	4100272	2026-09-30	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-10 14:37:20.327699
40	14	584	7523-21	CATETER PERFORMA JUDKINS 5F JR 4.0 100CM	CARDIO PERFUSION E.I.R.L	I3455577	2029-02-26	UND	15.00	25.00	8.00	8.00	1.00	1.00	8.00	0.00	EMB	\N	2026-06-10 14:37:20.340222
41	15	42	iq35f180j3	GUIA INQWIRE 3mm J 0.035” 180 X 01 UND.	CARDIO PERFUSION E.I.R.L	K3371732	2028-10-24	UND	15.00	25.00	10.00	10.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 15:31:59.746354
42	15	43	iq35f260j3	GUIA INQWIRE 3mm J 0.035” 260 X 01 UND.	CARDIO PERFUSION E.I.R.L	K3396584	2028-11-22	UND	15.00	25.00	20.00	20.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 15:31:59.809996
43	16	757	2507024820	TENSIOMETRO ANEROIDE EXACTA 1350	TARRILLO BARBA S.A.	13500000002507024820	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 15:33:11.523427
44	16	758	2507024821	TENSIOMETRO ANEROIDE EXACTA 1350	TARRILLO BARBA S.A.	13500000002507024821	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 15:33:11.534705
45	16	759	2507024822	TENSIOMETRO ANEROIDE EXACTA 1350	TARRILLO BARBA S.A.	13500000002507024822	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 15:33:11.542768
46	16	760	2507024823	TENSIOMETRO ANEROIDE EXACTA 1350	TARRILLO BARBA S.A.	13500000002507024823	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 15:33:11.550759
47	16	761	2507024824	TENSIOMETRO ANEROIDE EXACTA 1350	TARRILLO BARBA S.A.	13500000002507024824	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 15:33:11.55853
48	16	762	2507024825	TENSIOMETRO ANEROIDE EXACTA 1350	TARRILLO BARBA S.A.	13500000002507024825	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 15:33:11.566553
49	16	763	2507024826	TENSIOMETRO ANEROIDE EXACTA 1350	TARRILLO BARBA S.A.	13500000002507024826	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 15:33:11.609814
50	16	764	2507024827	TENSIOMETRO ANEROIDE EXACTA 1350	TARRILLO BARBA S.A.	13500000002507024827	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 15:33:11.617048
51	17	765	101.426	MONITOR FETAL  EDAN F6	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C	560038-M25910830007	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 16:45:59.212368
52	18	104	prod0016892	ICHROMA HBA1C NEO (HEMOGLOBINA GLICOSILADA) CAJA X 25 T.	RAPIDIAGNOSTICS S.A.C.	AAWAN11EX	2027-09-21	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-10 17:30:44.161885
53	18	105	244444321	ICHROMA MAU (MICROALBUMINA EN ORINA) CAJA X 25T	RAPIDIAGNOSTICS S.A.C.	MAVLX03EX	2027-08-17	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-10 17:30:44.172019
54	18	766	245152364	ICHROMA FERRITIN CAJA X 25T	RAPIDIAGNOSTICS S.A.C.	DFRVCA11	2026-11-09	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 17:30:44.17734
55	19	767	R0042C	ONSITE HBSAG COMBO RAPID TEST CAJA X 30 TEST	CIA. IMPORTADORA AMERICANA S.A.	F1010W1E00D	2027-10-14	UND	15.00	25.00	20.00	20.00	1.00	1.00	20.00	0.00	EMB	\N	2026-06-10 18:00:03.325886
56	20	768	ad 010/03	MANGO PARA BISTURI #3 NOPA	EDVAMEDICAL E.I.R.L	G222	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 20:10:59.689232
57	20	769	ab 060/16	PINZA DISEC. EC. STANDARD C/DIENTE 16CM NOPA	EDVAMEDICAL E.I.R.L	G185	\N	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-10 20:10:59.700028
58	20	770	ab 050/16	PINZA DISEC. EC. STANDARD S/DIENTE 16 CM NOPA	EDVAMEDICAL E.I.R.L	G222	\N	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-10 20:10:59.707309
59	20	771	aa 211/16	PINZA OCHSNER-KOCHER 1:2 CURVA 16 CM NOPA	EDVAMEDICAL E.I.R.L	D231	\N	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-10 20:10:59.773653
60	20	772	ae 100/16	PORTA- AGUJAS MAYO-HEGAR 16 CM NOPA	EDVAMEDICAL E.I.R.L	H129	\N	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-10 20:10:59.78103
61	20	773	ac 070/14	TIJERA MAYO RECTA RR 14.5 CM NOPA	EDVAMEDICAL E.I.R.L	H121	\N	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-10 20:10:59.788131
62	20	774	aa 150/14	PINZA HALSTED-MOSQUITO RECTA14CM NOPA	EDVAMEDICAL E.I.R.L	F229	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 20:10:59.795265
63	20	774	aa 150/14	PINZA HALSTED-MOSQUITO RECTA14CM NOPA	EDVAMEDICAL E.I.R.L	D129	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 20:10:59.802405
64	21	775	R0031C	ONSITE SYPHILIS AB COMBO RAPID TETS CAJA X 30 DET	CIA IMPORTADORA AMERICANA S.A.	F0331X3F00D	2028-04-02	UND	15.00	25.00	20.00	20.00	1.00	1.00	20.00	0.00	EMB	\N	2026-06-10 20:15:12.038703
65	22	776	TER2027	TERMOMETRO DIGITAL PUNTA FLEXIBLE UNIDAD	ALCIMAR'S MEDIC S.A.C.	202503027	2030-08-31	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-06-10 20:25:54.34229
66	23	777	02.01.210673	SENSOR SpO2 REUSABLE TIPO ENVOLVENTE NEONATAL C/CONECTOR DB9	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C.	H25B00450463	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 20:35:42.31257
67	23	778	H100B	PULSIOXIMETRO DE MANO SpO2 RECARGABLE	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C.	360101-M25C09810051	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 20:35:42.322908
68	24	779	1104150108	URINALYSIS REAGENT STRIPS 11P MISSIONS X 100 T	MONT GROUP SAC	URS5070060	2027-09-10	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-06-10 20:53:23.612072
69	25	780	04014	TARJETA EN GEL ID-LISS/COOMBS CAJA X 48	DIAGNOSTICA PERUANA S.A.C.	1045824328	2027-08-31	UND	15.00	25.00	96.00	96.00	1.00	1.00	96.00	0.00	EMB	\N	2026-06-10 21:07:59.0206
70	26	768	ad 010/03	MANGO PARA BISTURI #3 NOPA	EDVAMEDICAL E.I.R.L	G291	\N	UND	15.00	25.00	6.00	6.00	1.00	1.00	6.00	0.00	EMB	\N	2026-06-10 21:20:05.132839
71	26	781	ad 010/04	MANGO PARA BISTURI #4 NOPA	EDVAMEDICAL E.I.R.L	G291	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 21:20:05.182597
72	26	769	ab 060/16	PINZA DISEC. EC. STANDARD C/DIENTE 16CM NOPA	EDVAMEDICAL E.I.R.L	G185	\N	UND	15.00	25.00	15.00	15.00	1.00	1.00	15.00	0.00	EMB	\N	2026-06-10 21:20:05.194758
73	26	782	ab 050/14	PINZA DISEC. EC. STANDARD S/DIENTE 14.5 CM NOPA	EDVAMEDICAL E.I.R.L	G122	\N	UND	15.00	25.00	3.00	3.00	1.00	1.00	3.00	0.00	EMB	\N	2026-06-10 21:20:05.206745
74	26	770	ab 050/16	PINZA DISEC. EC. STANDARD S/DIENTE 16 CM NOPA	EDVAMEDICAL E.I.R.L	G222	\N	UND	15.00	25.00	6.00	6.00	1.00	1.00	6.00	0.00	EMB	\N	2026-06-10 21:20:05.219118
75	26	771	aa 211/16	PINZA OCHSNER-KOCHER 1:2 CURVA 16 CM NOPA	EDVAMEDICAL E.I.R.L	D231	\N	UND	15.00	25.00	12.00	12.00	1.00	1.00	12.00	0.00	EMB	\N	2026-06-10 21:20:05.231299
76	26	772	ae 100/16	PORTA- AGUJAS MAYO-HEGAR 16 CM NOPA	EDVAMEDICAL E.I.R.L	H129	\N	UND	15.00	25.00	7.00	7.00	1.00	1.00	7.00	0.00	EMB	\N	2026-06-10 21:20:05.272779
77	26	773	ac 070/14	TIJERA MAYO RECTA RR 14.5 CM NOPA	EDVAMEDICAL E.I.R.L	H131	\N	UND	15.00	25.00	12.00	12.00	1.00	1.00	12.00	0.00	EMB	\N	2026-06-10 21:20:05.285765
78	26	783	aa 210/18	PINZA OCHSNER-KOCHER 1:2 CURVA 18 CM NOPA	EDVAMEDICAL E.I.R.L	H122	\N	UND	15.00	25.00	6.00	6.00	1.00	1.00	6.00	0.00	EMB	\N	2026-06-10 21:20:05.297831
79	26	784	ac 365/16	TIJERA P.CORDON UMBILICAL BUSCH DE 16 CM NOPA	EDVAMEDICAL E.I.R.L	G238	\N	UND	15.00	25.00	3.00	3.00	1.00	1.00	3.00	0.00	EMB	\N	2026-06-10 21:20:05.368132
80	26	785	ac 351/22	TIJERA P. EPISIOTOMIA BRAUM-STANDLER 22 CM NOPA	EDVAMEDICAL E.I.R.L	AAB	\N	UND	15.00	25.00	3.00	3.00	1.00	1.00	3.00	0.00	EMB	\N	2026-06-10 21:20:05.379795
81	26	786	aa 172/16	PINZA KELLY-RANKIN RECTA 16CM NOPA	EDVAMEDICAL E.I.R.L	G185	\N	UND	15.00	25.00	3.00	3.00	1.00	1.00	3.00	0.00	EMB	\N	2026-06-10 21:20:05.391339
82	27	767	R0042C	ONSITE HBSAG COMBO RAPID TEST CAJA X 30 TEST	CIA. IMPORTADORA AMERICANA S.A.	F1010W1E00D	2027-10-14	UND	15.00	25.00	20.00	20.00	1.00	1.00	20.00	0.00	EMB	\N	2026-06-10 21:23:24.295411
83	28	104	prod0016892	ICHROMA HBA1C NEO (HEMOGLOBINA GLICOSILADA) CAJA X 25 T.	RAPIDIAGNOSTICS S.A.C.	AAWAN11EX	2027-09-21	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-10 21:23:50.926886
84	28	105	244444321	ICHROMA MAU (MICROALBUMINA EN ORINA) CAJA X 25T	RAPIDIAGNOSTICS S.A.C.	MAVLX03EX	2027-08-17	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-10 21:23:50.932519
85	28	766	245152364	ICHROMA FERRITIN CAJA X 25T	RAPIDIAGNOSTICS S.A.C.	DFRVCA11	2026-11-09	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 21:23:50.938683
86	29	765	101.426	MONITOR FETAL  EDAN F6	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C	560038-M25910830007	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 21:24:15.983807
87	30	787	7819307023	ACCU-CHEK INSTANT KIT x unidad	CORPORACION LYACOS E.I.R.L	407688	2027-07-08	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 21:35:38.200837
88	30	788	7819382023	ACCU- CHEK INSTANT X 50 TIRAS REACTIVAS TUBO	CORPORACION LYACOS E.I.R.L	304190	2027-09-02	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 21:35:38.217346
89	31	9	11510002	CATÉTER PARA DIAGNÓSTICO CORONARIO CURVA \r\nJUDKINS JR4 DE 5 FRENCH	JOSSON MEDICAL EIRL	SP1125121506	2028-12-23	UND	15.00	25.00	20.00	20.00	1.00	1.00	20.00	0.00	EMB	\N	2026-06-10 21:43:16.748614
90	31	5	53610009	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA TIPO JUDKINS DERECHA JR4 DE 6 FRENCH X 100 CCM	JOSSON MEDICAL EIRL	SP5324121808	2027-12-18	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-10 21:43:16.766154
91	31	45	bm-bid-i30	JERINGA DE ALTA PRESIÓN CON MANÓMETRO DE 20 CC -\r\nBROSMED X 01 UND.	JOSSON MEDICAL EIRL	2511114218	2028-11-10	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-06-10 21:43:16.778348
92	31	46	bm-hv01	Y CONNECTOR SETS  X  01 UND.	JOSSON MEDICAL EIRL	2506106166	2028-06-09	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-06-10 21:43:16.789965
93	31	4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	JOSSON MEDICAL EIRL	SP5325022829	2028-03-02	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-10 21:43:16.801892
94	31	4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	JOSSON MEDICAL EIRL	SP5325082210	2028-08-23	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-10 21:43:16.813626
95	32	789	302884	LARINGOSCOPIO MILLER-BABY ESTÁNDAR 7070	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	784828	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-11 15:24:25.169142
96	32	790	300871	FORMO CRESOL X 10 ML	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	504/25	2028-07-07	UND	15.00	25.00	9.00	9.00	1.00	1.00	9.00	0.00	EMB	\N	2026-06-11 15:24:25.186374
97	32	791	300270	PARAMONOCLOROFENOL REGULAR X 20ML	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	566/24	\N	UND	15.00	25.00	9.00	9.00	1.00	1.00	9.00	0.00	EMB	\N	2026-06-11 15:24:25.198343
98	33	792	302884	LARINGOSCOPIO MILLER-BABY ESTÁNDAR 7070	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	784828	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-11 15:33:13.964459
99	33	793	300871	FORMO CRESOL X 10 ML	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	504/25	2028-07-07	UND	15.00	25.00	9.00	9.00	1.00	1.00	9.00	0.00	EMB	\N	2026-06-11 15:33:14.0291
100	33	794	300270	PARAMONOCLOROFENOL REGULAR X 20ML	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	566/24	2027-06-27	UND	15.00	25.00	9.00	9.00	1.00	1.00	9.00	0.00	EMB	\N	2026-06-11 15:33:14.037373
101	34	795	775080	BRAZALETE TENSIOMETRO ADULTO	A. TARRILLO SA.	775080	\N	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-11 15:57:42.014553
102	34	796	72183	DYCAL FORMULA AVANZADA II	A. TARRILLO SA.	0000072183	2028-05-02	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-11 15:57:42.024188
103	35	797	MO14100167	RESUCITADOR MANUAL REUTILIZABLE DE SILICONA CON CORREA DE MANO ADULTO	DROGUERIA IMPORTADORA ANTONIO´S E.I.R.L.	MO14100167	\N	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-11 19:52:35.100853
104	35	798	MO14060356	RESUCITADOR MANUAL REUTILIZABLE DE SILICONA CON CORREA DE MANO ADULTO	DROGUERIA IMPORTADORA ANTONIO´S E.I.R.L.	MO14060356	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-11 19:52:35.11708
105	36	799	PM60	OXIMETRO DE PULSO PORTATIL MINDRAY PM60	BIOMEDICAL CARE SYSTEMS S.A.C.	CR-3C275446	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-11 20:07:51.897355
106	36	800	PM60	OXIMETRO DE PULSO PORTATIL MINDRAY PM60	BIOMEDICAL CARE SYSTEMS S.A.C.	CR-3C275447	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-11 20:07:51.906515
107	37	801	TUB0012	TUBO T/VERDE AL VACIO CON HEPARINA DE LITIO 3ML	GRUPO PALMISTA S.A.C.	251210	2027-11-01	UND	15.00	25.00	4.00	4.00	1.00	1.00	4.00	0.00	EMB	\N	2026-06-11 20:13:55.252839
108	38	795	775080	BRAZALETE TENSIOMETRO ADULTO	A. TARRILLO SA.	775080	\N	UND	15.00	25.00	2.00	2.00	1.00	1.00	2.00	0.00	EMB	\N	2026-06-11 21:42:24.960683
109	38	796	72183	DYCAL FORMULA AVANZADA II	A. TARRILLO SA.	0000072163	2028-05-02	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-11 21:42:24.982353
110	39	847	PE40355	VALGANCICLOVIR 450MG TABLETA RECUBIERTA 6X10 - VAGLICAN 450 X UND	SEVEN PHARMA	FD254945	2028-07-31	UND	15.00	25.00	120.00	120.00	1.00	1.00	120.00	0.00	EMB	\N	2026-06-18 15:47:54.488848
111	40	848	44085434	TACROLIMUS 1MG CAJA X 100 TAB	H REPS S.A.C.	RA4539	2027-10-31	UND	15.00	25.00	100.00	100.00	1.00	1.00	100.00	0.00	EMB	\N	2026-06-18 16:22:29.97364
112	41	700	bm-bid-ii30a	BALLOON INFLATION DEVICES	MIRET MEDICAL ASOCIADOS S.A.C. MIRET MED	2605189335	2029-05-17	UND	15.00	25.00	300.00	300.00	1.00	1.00	300.00	0.00	EMB	\N	2026-06-18 19:18:06.438902
113	42	700	bm-bid-ii30a	BALLOON INFLATION DEVICES	BROSMED MEDICAL CO., LTD.	2605189335	2029-05-17	UND	15.00	25.00	300.00	300.00	1.00	1.00	300.00	0.00	EMB	\N	2026-06-18 19:29:02.159672
114	43	624	mvl320	MYVAL 32.0 MM - TRANSCATHETER HEART VALVE X 01  UND	MERIL LIFE SCIENCES PVT LTD.	MVC19	2027-10-15	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:08:47.981383
115	43	630	nvt32035	NAVIGATOR 32.0X35MM - TRANSCATHETER HEART VALVE DELIVERY SYSTEM X 01 UND	MERIL LIFE SCIENCES PVT LTD.	PMTDF59	2027-08-06	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:08:47.994256
116	43	631	pht14	PYTHON INTRODUCER SET - 14F X 01 UND	MERIL LIFE SCIENCES PVT LTD.	PPHTC88	2027-12-29	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:08:48.001753
117	43	632	vldc	TRANSCATHETER HEART VALVE CRIMPING TOOL (STERILE) X 01 UND	MERIL LIFE SCIENCES PVT LTD.	PVLDCK38	2028-10-08	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:08:48.011222
118	43	636	mtv2540	MAMMOTH 25X40MM BALLOON DILATION CATHETER X 01 UND	MERIL LIFE SCIENCES PVT LTD.	PMTDF29	2028-09-27	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:08:48.019125
123	45	632	vldc	TRANSCATHETER HEART VALVE CRIMPING TOOL (STERILE) X 01 UND	MERIL LIFE SCIENCES PVT LTD.	PVLDCK13	2028-08-05	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:38:05.943565
124	46	681	fgtz250020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 20\r\nmm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	S25TZAQOAB	2027-06-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:48:08.271057
125	46	683	fgtz300012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 12\r\nmm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	S25TZANIAA	2027-05-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:48:08.28029
126	46	659	fgtz300016	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 16 mm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	S25TZALJAC	2027-05-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:48:08.286538
127	46	683	fgtz300012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 12\r\nmm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	S25TZANIAA	2027-05-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:48:08.292926
128	46	681	fgtz250020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 20\r\nmm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	S25TZAQSAA	2027-06-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:48:08.298922
129	46	717	rsc061125-hw45-ic20-k-s	BRILLIANT INTRODUCER 6FR x 11 CM	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	202512604	2028-12-10	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 20:48:08.304882
130	47	845	rm*af6j10sqw	KIT A INTRO RADIAL 6Fr x 10 (RADIFOCUS INTRODUCER II)	CARDIOMED S.A.C.	250910	2028-02-29	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-06-18 21:17:54.86474
131	48	713	rsc051125-hw45-ic20-k-s	BrilliantTM Introducer Kit - 5Fr x 11 cm	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	202511609	2028-11-02	UND	15.00	25.00	195.00	195.00	1.00	1.00	195.00	0.00	EMB	\N	2026-06-18 21:28:29.172107
132	49	653	fgtz275024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2,75 x 24 mm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	S25TZAOZAB	2027-06-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 21:37:38.266427
133	49	659	fgtz300016	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 16 mm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	S25TZALJAC	2027-05-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 21:37:38.287725
134	49	661	fgtz300028	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 28 mm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	P25TZAGDAB	2027-05-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 21:37:38.294188
135	49	671	fgtz400012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4 x 12 mm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	S25TZAOIAB	2027-05-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 21:37:38.299838
136	49	617	evf40016	Evermine50 Coro. Stent System-4.00x16mm	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	EFH56	2027-06-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 21:37:38.304546
137	50	746	ahw14r004j	ASAHI SION BLUE J	MULTI MED PERU S.A.C.	251224A291	2028-12-31	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-06-18 21:45:59.949216
138	50	842	apw14r010j	ASAHI SION BLACK 190CM J X UND.	MULTI MED PERU S.A.C.	260327A121	2029-03-31	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-06-18 21:46:00.006127
139	51	606	evf30024	Evermine50 Coro. Stent System-3.00x24mm	MERIL LIFE SCIENCES PVT LTD.	EFH47	2028-10-04	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 21:57:33.451838
140	51	684	fgtz300024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 24\r\nmm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	S25TZASMAC	2027-07-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-18 21:57:33.46618
119	44	875	1009660J	GUIA CORONARIA 014 BMW UNIVERSAL I 190CM	AFECORP PERU S.A.C.	4100272	2026-09-30	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-18 20:24:14.17768
120	44	882	7523-13	CATETER PERFORMA JUDKINS 5F JR 3.5 X 01 UND.	AFECORP PERU S.A.C.	I3455577	2029-02-26	UND	15.00	25.00	8.00	8.00	1.00	1.00	8.00	0.00	EMB	\N	2026-06-18 20:24:14.189461
121	44	892	iq35f180j3	GUIA INQWIRE 3mm J 0.035” 180 X 01 UND.	AFECORP PERU S.A.C.	K3371732	2028-10-24	UND	15.00	25.00	10.00	10.00	1.00	1.00	10.00	0.00	EMB	\N	2026-06-18 20:24:14.196165
122	44	883	iq35f260j3	GUIA INQWIRE 3mm J 0.035” 260 X 01 UND.	AFECORP PERU S.A.C.	K3396584	2028-11-22	UND	15.00	25.00	20.00	20.00	1.00	1.00	20.00	0.00	EMB	\N	2026-06-18 20:24:14.203311
141	52	585	evf22513	Evermine50 Coro. Stent System-2.25x13mm	MERIL LIFE SCIENCES PVT LTD.	EFH14	2028-07-05	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.809097
142	52	586	evf22516	Evermine50 Coro. Stent System-2.25x16mm	MERIL LIFE SCIENCES PVT LTD.	EFG99	2028-06-21	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.819983
143	52	587	evf22519	Evermine50 Coro. Stent System-2.25x19mm	MERIL LIFE SCIENCES PVT LTD.	EFH05	2028-06-26	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.827884
144	52	642	fgtz225024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.25 x 24 mm x 01 UND	MERIL LIFE SCIENCES PVT LTD.	S25TZASCAL	2027-07-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.835246
145	52	589	evf22529	Evermine50 Coro. Stent System-2.25x29mm	MERIL LIFE SCIENCES PVT LTD.	EFH07	2028-06-28	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.844449
146	52	645	fgtz250012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 12 mm x 01 UND	MERIL LIFE SCIENCES PVT LTD.	P25TZAGGAD	2027-06-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.85163
147	52	593	evf25019	Evermine50 Coro. Stent System-2.50x19mm	MERIL LIFE SCIENCES PVT LTD.	EFH23	2028-07-24	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.860252
148	52	648	fgtz250032	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 32 mm x 01 UND	MERIL LIFE SCIENCES PVT LTD.	P25TZAFWAA	2027-06-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.867398
149	52	650	fgtz275012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.75 x 12 mm x 01 UND	MERIL LIFE SCIENCES PVT LTD.	S25TZANRAA	2027-05-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.876087
150	52	651	fgtz275016	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.75 x 16 mm x 01 UND	MERIL LIFE SCIENCES PVT LTD.	S25TZAPAAC	2027-06-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.883095
151	52	652	fgtz275020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.75 x 20 mm x 01 UND	MERIL LIFE SCIENCES PVT LTD.	S25TZAPKAA	2027-06-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.891182
152	52	653	fgtz275024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2,75 x 24 mm x 01 UND	MERIL LIFE SCIENCES PVT LTD.	S25TZAOZAB	2027-06-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.898031
153	52	602	evf27532	Evermine50 Coro. Stent System-2.75x32mm	MERIL LIFE SCIENCES PVT LTD.	EFH50	2028-10-13	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.905219
154	52	683	fgtz300012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 12\r\nmm x 01 UND	MERIL LIFE SCIENCES PVT LTD.	S25TZAJYAD	2027-04-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.912491
155	52	604	evf30016	Evermine50 Coro. Stent System-3.00x16mm	MERIL LIFE SCIENCES PVT LTD.	EFH44	2028-10-01	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.954482
156	52	608	evf30032	Evermine50 Coro. Stent System-3.00x32mm	MERIL LIFE SCIENCES PVT LTD.	EFH63	2028-11-17	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.96192
157	52	611	evf35016	Evermine50 Coro. Stent System-3.50x16mm	MERIL LIFE SCIENCES PVT LTD.	EFH63	2028-11-17	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.969103
158	52	613	evf35024	Evermine50 Coro. Stent System-3.50x24mm	MERIL LIFE SCIENCES PVT LTD.	EFH62	2028-11-17	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.976149
159	52	614	evf35029	Evermine50 Coro. Stent System-3.50x29mm	MERIL LIFE SCIENCES PVT LTD.	EFH64	\N	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.983287
160	52	615	evf35032	Evermine50 Coro. Stent System-3.50x32mm	MERIL LIFE SCIENCES PVT LTD.	EFH42	2028-09-27	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.989873
161	52	672	fgtz400016	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4 x 16 mm x 01 UND	MERIL LIFE SCIENCES PVT LTD.	S25TZAOCAC	2027-05-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 16:28:10.996542
162	53	661	fgtz300028	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 28 mm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	P25TZAGDAB	2027-06-30	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 17:21:54.912218
163	53	673	fgtz400020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4 x 20 mm x 01 UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	S25TZARJAC	2027-07-31	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 17:21:54.922707
164	53	614	evf35029	Evermine50 Coro. Stent System-3.50x29mm	MERIL LIFE SCIENCES PVT LTD.	EFH64	2028-11-18	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 17:21:54.930381
165	53	615	evf35032	Evermine50 Coro. Stent System-3.50x32mm	MERIL LIFE SCIENCES PVT LTD.	EFH41	2028-09-27	UND	15.00	25.00	1.00	1.00	1.00	1.00	1.00	0.00	EMB	\N	2026-06-19 17:21:54.937533
166	54	840	26407504	CATETER GUIA CORONARIO XB3.5 S - AGUJE 6F EXTRA B-P	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	2405-0167	2027-04-30	UND	15.00	25.00	6.00	6.00	1.00	1.00	6.00	0.00	EMB	\N	2026-06-19 17:39:27.874434
167	55	700	bm-bid-ii30a	BALLOON INFLATION DEVICES	BROSMED MEDICAL CO.,LTD.	2605189335	2029-05-17	UND	15.00	25.00	300.00	300.00	1.00	1.00	300.00	0.00	EMB	\N	2026-06-19 17:52:21.293876
168	55	717	rsc061125-hw45-ic20-k-s	BRILLIANT INTRODUCER 6FR x 11 CM	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	202604636	2029-04-27	UND	15.00	25.00	500.00	500.00	1.00	1.00	500.00	0.00	EMB	\N	2026-06-19 17:52:21.339788
169	55	713	rsc051125-hw45-ic20-k-s	BrilliantTM Introducer Kit - 5Fr x 11 cm	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	202604635	2029-04-27	UND	15.00	25.00	200.00	200.00	1.00	1.00	200.00	0.00	EMB	\N	2026-06-19 17:52:21.351126
170	56	877	bm-bid-i30	JERINGA DE ALTA PRESIÓN CON MANÓMETRO DE 20 CC -\r\nBROSMED X 01 UND.	AFECORP PERU S.A.C.	2504259336	2028-04-24	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-19 18:03:04.357214
171	56	876	bm-hv01	Y CONNECTOR SETS  X  01 UND.	AFECORP PERU S.A.C.	2506106166	2028-06-09	UND	15.00	25.00	5.00	5.00	1.00	1.00	5.00	0.00	EMB	\N	2026-06-19 18:03:04.368557
\.


--
-- Data for Name: ajustes_stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ajustes_stock (id, producto_id, tipo, cantidad, motivo, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: alertas_vencimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alertas_vencimiento (id, lote_id, producto_id, lote_numero, fecha_vencimiento, estado, dias_faltantes, leida, created_at, updated_at, dias_para_vencer, cantidad) FROM stdin;
\.


--
-- Data for Name: auditorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditorias (id, usuario_id, accion, tabla_afectada, registro_id, valores_anteriores, valores_nuevos, ip_address, user_agent, created_at) FROM stdin;
1	1	LOGIN	usuarios	1	\N	\N	\N	\N	2026-05-27 16:50:08.035114
2	1	LOGIN	usuarios	1	\N	\N	\N	\N	2026-05-28 22:31:47.000668
3	1	LOGIN	usuarios	1	\N	\N	\N	\N	2026-06-01 04:23:24.746021
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, codigo, razon_social, cuit, direccion, distrito, provincia, departamento, categoria_riesgo, estado, telefono, email, activo, created_at, updated_at, persona_contacto) FROM stdin;
8	CLI-0332-001	HDM CAPITAL S.A.C.	20605390332	JR. DIANA INT.15,MZ.D2,LT.25,1°Y2° PISO URB.SANTA MARIA DE SURCO	Lima	Lima	\N	Bajo	Activo	\N	\N	1	2026-04-07 16:53:44.138508	2026-04-07 16:53:44.138508	\N
7	CLI-6895-001	LINEAGE	20613906895	Cal. Mercado Nro. 156 San Ramon 	Chanchamayo	Lima	Lima	Bajo	Activo	982 326 873	\N	1	2026-03-31 18:28:36.513	2026-04-07 17:03:16.906846	Gisella Palomino
9	CLI-5440-001	JR MEDIC E.I.R.L.	20613045440	CAL. CALCA N°324 URB.TAHUANTINSUYO ZN.DOS	INDEPENDENCIA	LIMA	LIMA	Bajo	Activo	\N	\N	1	2026-05-11 21:32:52.641138	2026-05-11 21:32:52.641138	Gisella Palomino
6	CLI-6571-001	IMPORTACIONES MEDICAS RZ S.A.C.	20610696571	JR. DIANA INT. 5, MZ. D2, LT. 25, 1 Y 2 PISO URB. SANTA MARIA DE SURCO	SANTIAGO DE SURCO	Lima	Lima	Bajo	Activo	\N	\N	1	2026-03-30 22:33:53.189	2026-05-22 15:03:25.568951	CHIPANA BLAS JUDITH PAMELA
13	CLI-8152-001	SALUDBOOST S.A.C.	20611918152	AV. DE LA ROCA DE VERGALLO N°493 INT.A,DPTO.1016 URB.SAN FELIPE	MAGDALENA DEL MAR	LIMA	LIMA	Bajo	Activo	\N	\N	1	2026-05-22 19:33:34.855968	2026-05-22 19:33:34.855968	\N
3	CLI-2241-001	MIRET MEDICAL ASOCIADOS S.A.C.	20605712241	JR. DIANA INT.11,MZ.D2,LT.25,1°Y2° PIS URB.SANTA MARIA DE SURCO	SANTIAGO DE SURCO	Lima	Lima	Bajo	Activo	\N	\N	1	2026-03-30 22:28:02.035	2026-05-29 20:38:43.348243	MONTALVO CORREA JOSSELYN NAYDU
14	CLI-9478-001	\t GLOBAL DRUG PERU S.A.C	20607309478	CAL. MATIER N°293 PISO.2,OFICINA.205 URB.SAN BORJA SUR	SAN BORJA	LIMA	LIMA	Bajo	Activo	957 275 924	\N	1	2026-06-18 15:34:17.711571	2026-06-18 15:34:17.711571	Carlizen Ugalde
1	CLI-8018-001	SUMEDIN S.A.C.	20608438018	JR. DIANA INT.12,MZ.D2,LT.25,1°Y2° PISO URB.SANTA MARIA DE SURCO	SANTIAGO DE SURCO	Lima	Lima	Alto	Activo	\N	\N	1	2026-03-30 22:25:17.024	2026-03-30 22:25:17.024	JOSSELYN MONTALVO
2	CLI-4871-001	AFECORP PERU S.A.C	20600124871	JR. DIANA INT-1,MZ D2,LT.25,1° Y 2° PISO URB.SANTA MARIA DE SURCO	SANTIAGO DE SURCO	Lima	Lima	No verificado	Activo	\N	\N	1	2026-03-30 22:26:33.447	2026-03-30 22:26:33.447	JOSSELYN MONTALVO CORREA
4	CLI-6211-001	SUNIX MEDICAL S.A.C.	20612226211	AV. LOS NOGALES N°251 DPTO.1203, INT.1	EL AGUSTINO	Lima	Lima	No verificado	Activo	\N	\N	1	2026-03-30 22:29:07.41	2026-03-30 22:29:07.41	CHIPANA BLAS JUDITH PAMELA
5	CLI-1991-001	TRAUMA SPINE E.I.R.L.	20606511991	CAL. CARLOS TENAUD NRO. 220. BARBONCITO	MIRAFLORES	Lima	LIma	Bajo	Activo	\N	\N	1	2026-03-30 22:31:44.953	2026-03-30 22:31:44.953	CHIPANA BLAS JUDITH PAMELA
\.


--
-- Data for Name: kardex; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kardex (id, producto_id, lote_numero, tipo_movimiento, cantidad, saldo, documento_tipo, documento_numero, referencia_id, observaciones, created_at) FROM stdin;
1	1	99532	INGRESO	10400.00	10400.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
2	2	99530	INGRESO	4000.00	4000.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
3	3	FST25062001	INGRESO	1200.00	1200.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
4	4	SP5324050510	INGRESO	10.00	10.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
5	5	SP5324091912	INGRESO	5.00	5.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
6	6	SP1124041023	INGRESO	5.00	5.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
7	6	SP1124041531	INGRESO	15.00	15.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
8	6	SP1124052316	INGRESO	15.00	15.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
9	4	SP5324050510	INGRESO	2.00	2.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
10	4	SP5325022823	INGRESO	8.00	8.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
11	5	SP5324091912	INGRESO	5.00	5.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
12	7	SP4125051505	INGRESO	2.00	2.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
13	8	SP4124040324	INGRESO	2.00	2.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
14	4	SP5325022823	INGRESO	10.00	10.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
15	6	SP1124041531	INGRESO	10.00	10.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
16	9	SP1124092024	INGRESO	10.00	10.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
17	4	SP5325022823	INGRESO	5.00	5.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
18	6	SP1124041531	INGRESO	15.00	15.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
19	5	SP5324091912	INGRESO	5.00	5.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
20	7	SP4125051505	INGRESO	3.00	3.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
21	10	SP4125080402	INGRESO	3.00	3.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
22	11	33998	INGRESO	60.00	60.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
23	12	34047	INGRESO	120.00	120.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
24	13	32965	INGRESO	90.00	90.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
25	14	34985	INGRESO	120.00	120.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
26	15	34415	INGRESO	120.00	120.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
27	16	34413	INGRESO	200.00	200.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
28	17	35088	INGRESO	400.00	400.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
29	18	34374	INGRESO	160.00	160.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
30	19	34525	INGRESO	150.00	150.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
31	20	35133	INGRESO	90.00	90.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
32	21	32781	INGRESO	87.00	87.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
33	22	34689	INGRESO	100.00	100.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
34	23	34919	INGRESO	100.00	100.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
35	24	35201	INGRESO	90.00	90.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
36	4	SP5325022829	INGRESO	10.00	10.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
37	6	SP1124052316	INGRESO	5.00	5.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
38	7	SP4125031203	INGRESO	2.00	2.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
39	8	SP4125022813	INGRESO	2.00	2.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
40	10	SP4125080402	INGRESO	2.00	2.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
41	25	SP5024091403	INGRESO	2.00	2.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
42	26	SP5025090304	INGRESO	2.00	2.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
43	27	VM03	INGRESO	48.00	48.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
44	28	SM04	INGRESO	48.00	48.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
45	29	VM03	INGRESO	48.00	48.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
46	30	VM03/38	INGRESO	36.00	36.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
47	31	PL02/17	INGRESO	36.00	36.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
48	32	TM04/64	INGRESO	24.00	24.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
49	33	VM03	INGRESO	36.00	36.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
50	34	SM04	INGRESO	90.00	90.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
51	35	VM03	INGRESO	24.00	24.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
52	36	VM03/38	INGRESO	90.00	90.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
53	9	SP1125081407	INGRESO	5.00	5.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
54	4	SP5325022829	INGRESO	5.00	5.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
55	6	SP1124052316	INGRESO	14.00	14.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
56	37	SP4125022805	INGRESO	6.00	6.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
57	7	SP4125031203	INGRESO	6.00	6.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
58	26	SP5025090304	INGRESO	2.00	2.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
59	38	202510	INGRESO	180.00	180.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
60	39	202510	INGRESO	72.00	72.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
61	40	202510	INGRESO	120.00	120.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
62	38	202510	INGRESO	288.00	288.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
63	39	202510	INGRESO	288.00	288.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
64	4	SP5325041706	INGRESO	10.00	10.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
65	4	SP5325041706	INGRESO	15.00	15.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
66	41	I3370429	INGRESO	21.00	21.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
67	42	K3371732	INGRESO	5.00	5.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
68	43	K3371675	INGRESO	80.00	80.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
69	44	I3356227	INGRESO	4.00	4.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
70	41	I3304184	INGRESO	4.00	4.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
71	44	I3356223	INGRESO	7.00	7.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
72	9	SP1125081407	INGRESO	9.00	9.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
73	5	SP5324121808	INGRESO	9.00	9.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
74	4	SP5325041706	INGRESO	15.00	15.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
75	45	2511114218	INGRESO	10.00	10.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
76	46	2506106166	INGRESO	10.00	10.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
77	44	I3304488	INGRESO	6.00	6.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
78	47	H2735360	INGRESO	1.00	1.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
79	48	H3247331	INGRESO	1.00	1.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
80	4	SP5325041706	INGRESO	8.00	8.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
81	45	2511114218	INGRESO	10.00	10.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
82	46	2506106166	INGRESO	10.00	10.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
83	5	SP5324121808	INGRESO	3.00	3.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
84	49	I3385327	INGRESO	3.00	3.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
85	43	K3377984	INGRESO	8.00	8.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
86	50	I3356253	INGRESO	15.00	15.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
87	51	6021241	INGRESO	1.00	1.00	NOTA_INGRESO	00000001	1	\N	2026-05-21 06:48:17.996923
186	1	99532	SALIDA	1100.00	9300.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
187	2	99530	SALIDA	500.00	3500.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
188	1	99532	SALIDA	1350.00	7950.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
189	2	99530	SALIDA	500.00	3000.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
190	1	99532	SALIDA	1350.00	6600.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
191	2	99530	SALIDA	500.00	2500.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
192	3	FST25062001	SALIDA	400.00	800.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
193	3	FST25062001	SALIDA	420.00	380.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
194	1	99532	SALIDA	1350.00	5250.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
195	2	99530	SALIDA	500.00	2000.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
196	3	FST25062001	SALIDA	380.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
197	1	99532	SALIDA	1350.00	3900.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
198	2	99530	SALIDA	500.00	1500.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
199	1	99532	SALIDA	1350.00	2550.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
200	2	99530	SALIDA	500.00	1000.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
201	1	99532	SALIDA	2550.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
202	2	99530	SALIDA	1000.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
203	11	33998	SALIDA	60.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
204	12	34047	SALIDA	120.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
205	13	32965	SALIDA	90.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
206	14	34985	SALIDA	120.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
207	15	34415	SALIDA	120.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
208	24	35201	SALIDA	90.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
209	16	34413	SALIDA	200.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
210	17	35088	SALIDA	400.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
211	18	34374	SALIDA	160.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
212	19	34525	SALIDA	150.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
213	20	35133	SALIDA	90.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
214	21	32781	SALIDA	87.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
215	22	34689	SALIDA	100.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
216	23	34919	SALIDA	100.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
217	4	SP5325022829	SALIDA	10.00	5.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
218	6	SP1124052316	SALIDA	5.00	29.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
219	7	SP4125031203	SALIDA	2.00	6.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
220	8	SP4125022813	SALIDA	2.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
221	10	SP4125080402	SALIDA	2.00	3.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
222	25	SP5024091403	SALIDA	2.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
223	26	SP5025090304	SALIDA	2.00	2.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
224	9	SP1125081407	SALIDA	5.00	9.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
225	4	SP5325022829	SALIDA	5.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
226	6	SP1124052316	SALIDA	14.00	15.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
227	37	SP4125022805	SALIDA	6.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
228	7	SP4125031203	SALIDA	6.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
229	26	SP5025090304	SALIDA	2.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
230	4	SP5325041706	SALIDA	10.00	38.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
231	33	VM03	SALIDA	36.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
232	34	SM04	SALIDA	90.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
233	35	VM03	SALIDA	24.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
234	36	VM03/38	SALIDA	90.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
235	27	VM03	SALIDA	48.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
236	28	SM04	SALIDA	48.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
237	29	VM03	SALIDA	48.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
238	30	VM03/38	SALIDA	36.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
239	31	PL02/17	SALIDA	36.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
240	32	TM04/64	SALIDA	24.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
241	4	SP5325041706	SALIDA	15.00	23.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
242	41	I3370429	SALIDA	21.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
243	42	K3371732	SALIDA	5.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
244	43	K3371675	SALIDA	80.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
245	44	I3356227	SALIDA	4.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
246	41	I3304184	SALIDA	4.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
247	44	I3356223	SALIDA	7.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
248	9	SP1125081407	SALIDA	9.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
249	5	SP5324121808	SALIDA	9.00	3.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
250	4	SP5325041706	SALIDA	15.00	8.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
251	45	2511114218	SALIDA	10.00	10.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
252	46	2506106166	SALIDA	10.00	10.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
253	44	I3304488	SALIDA	6.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
254	47	H2735360	SALIDA	1.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
255	48	H3247331	SALIDA	1.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
256	4	SP5325041706	SALIDA	8.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
257	45	2511114218	SALIDA	10.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
258	46	2506106166	SALIDA	10.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
259	5	SP5324121808	SALIDA	3.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
260	49	I3385327	SALIDA	3.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
261	43	K3377984	SALIDA	8.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
262	50	I3356253	SALIDA	15.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
263	51	6021241	SALIDA	1.00	0.00	NOTA_SALIDA	00000001	4	\N	2026-05-21 17:49:31.918911
264	52	2511090101	INGRESO	1404.00	1404.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
265	53	2511047801	INGRESO	432.00	432.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
266	53	2510043501	INGRESO	108.00	108.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
267	54	2510042301	INGRESO	648.00	648.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
268	55	2510010701	INGRESO	2154.00	2154.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
269	55	2510003001	INGRESO	1356.00	1356.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
270	56	2510067901	INGRESO	1845.00	1845.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
271	55	2509095101	INGRESO	90.00	90.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
272	57	2509030901	INGRESO	12.00	12.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
273	57	2510041201	INGRESO	78.00	78.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
274	58	2511014801	INGRESO	594.00	594.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
275	59	2511015301	INGRESO	1248.00	1248.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
276	60	241189400	INGRESO	72.00	72.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
277	61	2512003601	INGRESO	2268.00	2268.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
278	59	2512012101	INGRESO	1344.00	1344.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
279	62	2403049101	INGRESO	64.00	64.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
280	62	2308074801	INGRESO	32.00	32.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
281	63	2509098301	INGRESO	162.00	162.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
282	64	2510071701	INGRESO	162.00	162.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
283	65	2509047201	INGRESO	162.00	162.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
284	66	2510098701	INGRESO	162.00	162.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
285	67	2509092101	INGRESO	78.00	78.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
286	68	2509111101	INGRESO	156.00	156.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
287	69	2509109401	INGRESO	78.00	78.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
288	70	25101143	INGRESO	660.00	660.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
289	71	2402052101	INGRESO	144.00	144.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
290	72	2507002501	INGRESO	78.00	78.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
291	73	2511048601	INGRESO	87.00	87.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
292	73	2507028801	INGRESO	69.00	69.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
293	74	2507076601	INGRESO	78.00	78.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
294	75	2510049801	INGRESO	30.00	30.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
295	75	2510075001	INGRESO	318.00	318.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
296	76	2506268201	INGRESO	64.00	64.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
297	77	2511022701	INGRESO	420.00	420.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
298	78	25110097	INGRESO	576.00	576.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
299	59	2511090601	INGRESO	1296.00	1296.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
300	61	2510042801	INGRESO	594.00	594.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
301	61	2510115601	INGRESO	642.00	642.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
302	61	2510042801	INGRESO	42.00	42.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
303	79	2411062100	INGRESO	72.00	72.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
304	80	2505032900	INGRESO	72.00	72.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
305	81	2506030700	INGRESO	1944.00	1944.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
306	81	2505004800	INGRESO	2988.00	2988.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
307	82	2511086701	INGRESO	1860.00	1860.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
308	83	2503052801	INGRESO	114.00	114.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
309	84	2506049601	INGRESO	124.00	124.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
310	85	2510075401	INGRESO	126.00	126.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
311	86	2510075501	INGRESO	189.00	189.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
312	87	2511023301	INGRESO	126.00	126.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
313	76	2506268201	INGRESO	320.00	320.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
314	76	2504068001	INGRESO	224.00	224.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
315	88	2511053301	INGRESO	960.00	960.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
316	77	2511022701	INGRESO	240.00	240.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
317	84	2506049601	INGRESO	272.00	272.00	NOTA_INGRESO	00000002	2	\N	2026-05-21 18:15:35.017837
318	55	2509095101	SALIDA	90.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
319	55	2510010701	SALIDA	1206.00	948.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
320	55	2510010701	SALIDA	948.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
321	55	2510003001	SALIDA	1356.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
322	59	2511015301	SALIDA	486.00	762.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
323	61	2512003601	SALIDA	1080.00	1188.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
324	52	2511090101	SALIDA	603.00	801.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
325	56	2510067901	SALIDA	1215.00	630.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
326	77	2511022701	SALIDA	210.00	450.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
327	70	25101143	SALIDA	660.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
328	54	2510042301	SALIDA	270.00	378.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
329	58	2511014801	SALIDA	540.00	54.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
330	53	2511047801	SALIDA	432.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
331	78	25110097	SALIDA	324.00	252.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
332	63	2509098301	SALIDA	162.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
333	64	2510071701	SALIDA	162.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
334	65	2509047201	SALIDA	162.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
335	66	2510098701	SALIDA	162.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
336	72	2507002501	SALIDA	78.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
337	67	2509092101	SALIDA	78.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
338	57	2509030901	SALIDA	12.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
339	57	2510041201	SALIDA	78.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
340	82	2511086701	SALIDA	1860.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
341	59	2511090601	SALIDA	1296.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
342	81	2506030700	SALIDA	828.00	1116.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
343	88	2511053301	SALIDA	576.00	384.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
344	61	2510042801	SALIDA	486.00	150.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
345	83	2503052801	SALIDA	105.00	9.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
346	77	2511022701	SALIDA	240.00	210.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
347	86	2510075501	SALIDA	189.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
348	87	2511023301	SALIDA	126.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
349	85	2510075401	SALIDA	126.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
350	80	2505032900	SALIDA	72.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
351	79	2411062100	SALIDA	72.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
352	77	2511022701	SALIDA	180.00	30.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
353	56	2510067901	SALIDA	450.00	180.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
354	75	2510049801	SALIDA	30.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
355	75	2510075001	SALIDA	318.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
356	76	2506268201	SALIDA	48.00	336.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
357	62	2308074801	SALIDA	32.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
358	62	2403049101	SALIDA	48.00	16.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
359	71	2402052101	SALIDA	144.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
360	52	2511090101	SALIDA	702.00	99.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
361	61	2512003601	SALIDA	1188.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
362	53	2510043501	SALIDA	108.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
363	54	2510042301	SALIDA	378.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
364	73	2507028801	SALIDA	69.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
365	73	2511048601	SALIDA	87.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
366	68	2509111101	SALIDA	156.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
367	69	2509109401	SALIDA	78.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
368	74	2507076601	SALIDA	78.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
369	78	25110097	SALIDA	252.00	0.00	NOTA_SALIDA	00000002	5	\N	2026-05-21 21:06:17.11392
370	84	2506049601	SALIDA	396.00	0.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
371	76	2506268201	SALIDA	320.00	16.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
372	76	2504068001	SALIDA	224.00	0.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
373	61	2510042801	SALIDA	150.00	0.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
374	61	2510115601	SALIDA	642.00	0.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
375	81	2506030700	SALIDA	1116.00	0.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
376	81	2505004800	SALIDA	2988.00	0.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
377	59	2512012101	SALIDA	1344.00	0.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
378	59	2511015301	SALIDA	762.00	0.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
379	88	2511053301	SALIDA	384.00	0.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
380	83	2503052801	SALIDA	9.00	0.00	NOTA_SALIDA	00000003	6	\N	2026-05-21 21:43:34.983856
393	91	20240620	INGRESO	10.00	10.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
394	92	HE0325AM	INGRESO	10.00	10.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
395	93	IN25008662	INGRESO	30.00	30.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
396	94	212164	INGRESO	30.00	30.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
397	95	20250418	INGRESO	31.00	31.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
398	96	210015	INGRESO	50.00	50.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
399	97	G253	INGRESO	1.00	1.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
400	98	IN1240527	INGRESO	70.00	70.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
401	99	IN250523	INGRESO	70.00	70.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
402	100	303919	INGRESO	53.00	53.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
403	101	202507V	INGRESO	50.00	50.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
404	102	360124-M24912370023	INGRESO	1.00	1.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
405	102	360124-M25410060001	INGRESO	1.00	1.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
406	103	361527- M25C10210005	INGRESO	1.00	1.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
407	104	AAVLK09EX	INGRESO	3.00	3.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
408	105	MAVFH04EX	INGRESO	3.00	3.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
409	106	360080-M25520140001	INGRESO	1.00	1.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
410	101	202507V	INGRESO	4.00	4.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
411	107	2025081551	INGRESO	2.00	2.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
412	108	2025081451	INGRESO	4.00	4.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
413	101	202507V	INGRESO	40.00	40.00	NOTA_INGRESO	00000004	4	\N	2026-05-22 17:04:10.870925
414	98	IN1240527	SALIDA	70.00	0.00	NOTA_SALIDA	00000005	8	\N	2026-05-22 17:09:57.514601
415	100	303919	SALIDA	53.00	0.00	NOTA_SALIDA	00000005	8	\N	2026-05-22 17:09:57.514601
416	99	IN250523	SALIDA	70.00	0.00	NOTA_SALIDA	00000005	8	\N	2026-05-22 17:09:57.514601
417	96	210015	SALIDA	50.00	0.00	NOTA_SALIDA	00000006	9	\N	2026-05-22 17:14:08.486781
418	91	20240620	SALIDA	10.00	0.00	NOTA_SALIDA	00000006	9	\N	2026-05-22 17:14:08.486781
419	95	20250418	SALIDA	31.00	0.00	NOTA_SALIDA	00000006	9	\N	2026-05-22 17:14:08.486781
420	94	212164	SALIDA	30.00	0.00	NOTA_SALIDA	00000006	9	\N	2026-05-22 17:14:08.486781
421	93	IN25008662	SALIDA	30.00	0.00	NOTA_SALIDA	00000006	9	\N	2026-05-22 17:14:08.486781
422	92	HE0325AM	SALIDA	10.00	0.00	NOTA_SALIDA	00000006	9	\N	2026-05-22 17:14:08.486781
423	97	G253	SALIDA	1.00	0.00	NOTA_SALIDA	00000007	10	\N	2026-05-22 17:16:28.605482
424	102	360124-M24912370023	SALIDA	1.00	0.00	NOTA_SALIDA	00000008	11	\N	2026-05-22 17:23:05.139482
425	102	360124-M25410060001	SALIDA	1.00	0.00	NOTA_SALIDA	00000008	11	\N	2026-05-22 17:23:05.139482
426	101	202507V	SALIDA	35.00	59.00	NOTA_SALIDA	00000009	12	\N	2026-05-22 17:25:18.977672
427	101	202507V	SALIDA	3.00	56.00	NOTA_SALIDA	00000010	13	\N	2026-05-22 17:26:35.69029
428	101	202507V	SALIDA	1.00	55.00	NOTA_SALIDA	00000011	14	\N	2026-05-22 17:28:04.298217
429	103	361527- M25C10210005	SALIDA	1.00	0.00	NOTA_SALIDA	00000012	15	\N	2026-05-22 17:29:35.012756
430	106	360080-M25520140001	SALIDA	1.00	0.00	NOTA_SALIDA	00000013	16	\N	2026-05-22 17:31:09.613972
431	107	2025081551	SALIDA	2.00	0.00	NOTA_SALIDA	00000014	17	\N	2026-05-22 17:33:26.953266
432	108	2025081451	SALIDA	4.00	0.00	NOTA_SALIDA	00000015	18	\N	2026-05-22 17:34:46.675756
433	101	202507V	SALIDA	15.00	40.00	NOTA_SALIDA	00000016	19	\N	2026-05-22 17:37:38.322872
434	104	AAVLK09EX	SALIDA	3.00	0.00	NOTA_SALIDA	00000017	20	\N	2026-05-22 17:39:25.688242
435	105	MAVFH04EX	SALIDA	3.00	0.00	NOTA_SALIDA	00000018	21	\N	2026-05-22 17:40:24.186056
436	101	202507V	SALIDA	14.00	26.00	NOTA_SALIDA	00000019	22	\N	2026-05-22 17:42:23.818903
437	101	202507V	SALIDA	20.00	6.00	NOTA_SALIDA	00000020	23	\N	2026-05-22 17:43:30.560051
438	109	20260225J1	INGRESO	500.00	500.00	NOTA_INGRESO	00000005	5	\N	2026-05-22 19:39:58.723865
1968	574	F22B123C2	INGRESO	2.00	2.00	NOTA_INGRESO	00000012	12	\N	2026-06-01 20:56:22.3506
1969	574	F22B123C2	SALIDA	2.00	0.00	NOTA_SALIDA	00000030	33	\N	2026-06-01 20:59:06.41841
441	109	20260225J1	SALIDA	498.00	2.00	NOTA_SALIDA	00000022	25	\N	2026-05-22 19:51:40.686306
442	325	SN-560435M25308290001	INGRESO	1.00	1.00	NOTA_INGRESO	00000006	6	\N	2026-05-22 20:37:59.194105
443	325	SN-560435M25308290001	SALIDA	1.00	0.00	NOTA_SALIDA	00000023	26	\N	2026-05-22 20:43:43.348421
444	326	2040355	INGRESO	500.00	500.00	NOTA_INGRESO	00000007	7	\N	2026-05-22 21:14:37.008465
445	327	2103144	INGRESO	1000.00	1000.00	NOTA_INGRESO	00000008	8	\N	2026-05-22 21:19:09.526797
446	327	2103144	SALIDA	1000.00	0.00	NOTA_SALIDA	00000024	27	\N	2026-05-22 21:21:54.065481
447	326	2040355	SALIDA	500.00	0.00	NOTA_SALIDA	00000024	27	\N	2026-05-22 21:21:54.065481
448	110	SM0612-062301	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
449	111	SM0612-062302	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
450	112	SM0612-062303	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
451	113	SM0612-062304	INGRESO	36.00	36.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
452	114	SM0612-062305	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
453	115	SM0612-062306	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
454	116	SM0612-062307	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
455	117	SM0612-062308	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
456	118	SM0612-062309	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
457	119	SM0612-062310	INGRESO	25.00	25.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
458	120	SM0612-062311	INGRESO	25.00	25.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
459	121	SM0612-062312	INGRESO	30.00	30.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
460	122	SM0612-062313	INGRESO	36.00	36.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
461	123	SM0612-062314	INGRESO	30.00	30.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
462	124	SM0612-062315	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
463	125	SM0612-062316	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
464	126	SM0612-062317	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
465	127	SM0612-062318	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
466	128	SM0612-062319	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
467	129	SM0612-062320	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
468	130	SM0612-062321	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
469	131	SM0612-062322	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
470	132	SM0612-062323	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
471	133	SM0612-062324	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
472	134	SM0612-062325	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
473	135	SM0612-062326	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
474	136	SM0612-062327	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
475	137	SM0612-062328	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
476	138	SM0612-062329	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
477	139	SM0612-062330	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
478	140	SM0612-062331	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
479	141	SM0612-062332	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
480	142	SM0612-062333	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
481	143	SM0612-062334	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
482	144	SM0612-062335	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
483	145	SM0612-062336	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
484	146	SM0612-062337	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
485	147	SM0612-062338	INGRESO	10.00	10.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
486	148	SM0612-062339	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
487	149	SM0612-062340	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
488	150	SM0612-062341	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
489	151	SM0612-062342	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
490	152	SM0612-062344	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
491	153	SM0612-062345	INGRESO	19.00	19.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
492	154	SM0612-062346	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
493	155	SM0612-062347	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
494	156	SM0612-062348	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
495	157	SM0612-062349	INGRESO	31.00	31.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
496	158	SM0612-062350	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
497	159	SM0612-062351	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
498	160	SM0612-062352	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
499	161	SM0612-062201	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
500	162	SM0612-062202	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
501	163	SM0612-062203	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
502	164	SM0612-062204	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
503	165	SM0612-062205	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
504	166	SM0612-062206	INGRESO	30.00	30.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
505	167	SM0612-062207	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
506	168	SM0612-062208	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
507	169	SM0612-062209	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
508	170	SM0612-062210	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
509	171	SM0612-062211	INGRESO	8.00	8.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
510	172	SM0612-062212	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
511	173	SM0612-062213	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
512	174	SM0612-062214	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
513	175	SM0612-062215	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
514	176	SM0612-062216	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
515	177	SM0612-062217	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
516	178	SM0612-062218	INGRESO	42.00	42.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
517	179	SM0612-062219	INGRESO	42.00	42.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
518	180	SM0612-062220	INGRESO	42.00	42.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
519	181	SM0612-062221	INGRESO	42.00	42.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
520	182	SM0612-062222	INGRESO	42.00	42.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
521	183	SM0612-062223	INGRESO	42.00	42.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
522	184	SM0612-062224	INGRESO	42.00	42.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
523	185	SM0612-062225	INGRESO	42.00	42.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
524	186	SM0612-062226	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
525	187	SM0612-062227	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
526	188	SM0612-062228	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
527	189	SM0612-062229	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
528	190	SM0612-062001	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
529	191	SM0612-062002	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
530	192	SM0612-062003	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
531	193	SM0612-062004	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
532	194	SM0612-062005	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
533	195	SM0612-062006	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
534	196	SM0612-062007	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
535	197	SM0612-062008	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
536	198	SM0612-062009	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
537	199	SM0612-062010	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
538	200	SM0612-062011	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
539	201	SM0612-062012	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
540	202	SM0612-062013	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
541	203	SM0612-062014	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
542	204	SM0612-062015	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
543	205	SM0612-062016	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
544	206	SM0612-062017	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
545	207	SM0612-062018	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
546	208	SM0612-062019	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
547	209	SM0612-062020	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
548	210	SM0612-062021	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
549	211	SM0612-062022	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
550	212	SM0612-062023	INGRESO	15.00	15.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
551	213	SM0612-062024	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
552	214	SM0612-062025	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
553	215	SM0612-062026	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
554	216	SM0612-062027	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
555	217	SM0612-062028	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
556	218	SM0612-062029	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
557	219	SM0612-062030	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
558	220	SM0612-062031	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
559	221	SM0612-062032	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
560	222	SM0612-062033	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
561	223	SM0612-062034	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
562	224	SM0612-062035	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
563	225	SM0612-062036	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
564	226	SM0612-062037	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
565	227	SM0612-062038	INGRESO	48.00	48.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
566	228	SM0612-062039	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
567	229	SM0612-062040	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
568	230	SM0612-062041	INGRESO	25.00	25.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
569	231	SM0612-062042	INGRESO	30.00	30.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
570	232	SM0612-062043	INGRESO	30.00	30.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
571	233	SM0612-062044	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
572	234	SM0612-062045	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
573	235	SM0612-062046	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
574	236	SM0612-062047	INGRESO	11.00	11.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
575	237	SM0612-062048	INGRESO	13.00	13.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
576	238	SM0612-062049	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
577	239	SM0612-062051	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
578	240	SM0612-062052	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
579	241	SM0612-062053	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
580	242	SM0612-062054	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
581	243	SM0612-062055	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
582	244	SM0612-062056	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
583	245	SM0612-062057	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
584	246	SM0612-062058	INGRESO	25.00	25.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
585	247	SM0612-062059	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
586	248	SM0612-062060	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
587	249	SM0612-062067	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
588	250	SM0612-062061	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
589	251	SM0612-062062	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
590	252	SM0612-062063	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
591	253	SM0612-062064	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
592	254	SM0612-062065	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
593	255	SM0612-062066	INGRESO	2.00	2.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
594	256	SM0612-062101	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
595	257	SM0612-062102	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
596	258	SM0612-062103	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
597	259	SM0612-062104	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
598	260	SM0612-062105	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
599	261	SM0612-062106	INGRESO	13.00	13.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
600	262	SM0612-062107	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
601	263	SM0612-062108	INGRESO	10.00	10.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
602	264	SM0612-062109	INGRESO	15.00	15.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
603	328	SM0612-062110	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
604	329	SM0612-062111	INGRESO	42.00	42.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
605	330	SM0612-062112	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
606	331	SM0612-062113	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
607	332	SM0612-062114	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
608	333	SM0612-062115	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
609	334	SM0612-062116	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
610	335	SM0612-062117	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
611	336	SM0612-062118	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
612	337	SM0612-062119	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
613	338	SM0612-062120	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
614	339	SM0612-062121	INGRESO	132.00	132.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
615	340	SM0612-062122	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
616	341	SM0612-062123	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
617	342	SM0612-062124	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
618	343	SM0612-062125	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
619	344	SM0612-062126	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
620	345	SM0612-062127	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
621	346	SM0612-062128	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
622	347	SM0612-062129	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
623	348	SM0612-062130	INGRESO	18.00	18.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
624	349	SM0612-062131	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
625	350	SM0612-062132	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
626	351	SM0612-062133	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
627	352	SM0612-062134	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
628	353	SM0612-062135	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
629	354	SM0612-062136	INGRESO	48.00	48.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
630	265	SM0612-062401	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
631	266	SM0612-062402	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
632	267	SM0612-062403	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
633	268	SM0612-062404	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
634	269	SM0612-062405	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
635	270	SM0612-062406	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
636	271	SM0612-062407	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
637	272	SM0612-062408	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
638	273	SM0612-062409	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
639	274	SM0612-062410	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
640	275	SM0612-062411	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
641	276	SM0612-062412	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
642	277	SM0612-062413	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
643	278	SM0612-062414	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
644	279	SM0612-062415	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
645	280	SM0612-062416	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
646	281	SM0612-062417	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
647	282	SM0612-062418	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
648	283	SM0612-062419	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
649	284	SM0612-062420	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
650	285	SM0612-062421	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
651	286	SM0612-062422	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
652	287	SM0612-062423	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
653	288	SM0612-062424	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
654	289	SM0612-062425	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
655	290	SM0612-062426	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
656	291	SM0612-062427	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
657	292	SM0612-062428	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
658	293	SM0612-062429	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
659	294	SM0612-062430	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
660	295	SM0612-062431	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
661	296	SM0612-062432	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
662	297	SM0612-062433	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
663	298	SM0612-062434	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
664	299	SM0612-062435	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
665	300	SM0612-062436	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
666	301	SM0612-062438	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
667	302	SM0612-062439	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
668	303	SM0612-062440	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
669	304	SM0612-062441	INGRESO	36.00	36.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
670	305	SM0612-062442	INGRESO	24.00	24.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
671	306	SM0612-062443	INGRESO	50.00	50.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
672	307	SM0612-062444	INGRESO	50.00	50.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
673	308	SM0612-062445	INGRESO	50.00	50.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
674	309	SM0612-062446	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
675	310	SM0612-062447	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
676	311	SM0612-062448	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
677	312	SM0612-062449	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
678	313	SM0612-062450	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
679	314	SM0612-062451	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
680	315	SM0612-062452	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
681	316	SM0612-062453	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
682	317	SM0612-062454	INGRESO	12.00	12.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
683	318	SM0612-062455	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
684	319	SM0612-062456	INGRESO	6.00	6.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
685	320	SM0612-062457	INGRESO	3.00	3.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
686	321	SM0612-062461	INGRESO	2.00	2.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
687	322	SM0612-062458	INGRESO	2.00	2.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
688	323	SM0612-062459	INGRESO	2.00	2.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
689	324	SM0612-062460	INGRESO	2.00	2.00	NOTA_INGRESO	00000009	9	\N	2026-05-26 00:23:00.590089
690	9	SP1125121506	INGRESO	20.00	20.00	NOTA_INGRESO	00000010	10	\N	2026-05-27 20:44:48.616357
691	5	SP5324121808	INGRESO	5.00	5.00	NOTA_INGRESO	00000010	10	\N	2026-05-27 20:44:48.616357
692	45	2511114218	INGRESO	10.00	10.00	NOTA_INGRESO	00000010	10	\N	2026-05-27 20:44:48.616357
693	46	2506106166	INGRESO	10.00	10.00	NOTA_INGRESO	00000010	10	\N	2026-05-27 20:44:48.616357
694	4	SP5325022829	INGRESO	1.00	1.00	NOTA_INGRESO	00000010	10	\N	2026-05-27 20:44:48.616357
695	4	SP5325082210	INGRESO	5.00	5.00	NOTA_INGRESO	00000010	10	\N	2026-05-27 20:44:48.616357
696	9	SP1125121506	SALIDA	20.00	0.00	NOTA_SALIDA	00000025	28	\N	2026-05-27 21:11:41.72801
697	5	SP5324121808	SALIDA	5.00	0.00	NOTA_SALIDA	00000025	28	\N	2026-05-27 21:11:41.72801
698	45	2511114218	SALIDA	10.00	0.00	NOTA_SALIDA	00000025	28	\N	2026-05-27 21:11:41.72801
699	46	2506106166	SALIDA	10.00	0.00	NOTA_SALIDA	00000025	28	\N	2026-05-27 21:11:41.72801
700	4	SP5325022829	SALIDA	1.00	0.00	NOTA_SALIDA	00000025	28	\N	2026-05-27 21:11:41.72801
701	4	SP5325082210	SALIDA	5.00	0.00	NOTA_SALIDA	00000025	28	\N	2026-05-27 21:11:41.72801
702	7	SP4125051505	SALIDA	5.00	0.00	NOTA_SALIDA	00000026	29	\N	2026-05-28 17:00:08.378481
703	8	SP4124040324	SALIDA	2.00	0.00	NOTA_SALIDA	00000026	29	\N	2026-05-28 17:00:08.378481
704	10	SP4125080402	SALIDA	3.00	0.00	NOTA_SALIDA	00000026	29	\N	2026-05-28 17:00:08.378481
705	4	SP5324050510	SALIDA	12.00	0.00	NOTA_SALIDA	00000026	29	\N	2026-05-28 17:00:08.378481
706	4	SP5325022823	SALIDA	23.00	0.00	NOTA_SALIDA	00000027	30	\N	2026-05-28 17:02:29.627232
707	6	SP1124041531	SALIDA	40.00	0.00	NOTA_SALIDA	00000027	30	\N	2026-05-28 17:02:29.627232
708	6	SP1124052316	SALIDA	15.00	0.00	NOTA_SALIDA	00000027	30	\N	2026-05-28 17:02:29.627232
709	5	SP5324091912	SALIDA	15.00	0.00	NOTA_SALIDA	00000028	31	\N	2026-05-28 17:04:47.523325
710	9	SP1124092024	SALIDA	10.00	0.00	NOTA_SALIDA	00000028	31	\N	2026-05-28 17:04:47.523325
711	6	SP1124041023	SALIDA	5.00	0.00	NOTA_SALIDA	00000028	31	\N	2026-05-28 17:04:47.523325
712	208	SM0612-062019	SALIDA	1.00	11.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
713	199	SM0612-062010	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
714	215	SM0612-062026	SALIDA	8.00	10.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
715	227	SM0612-062038	SALIDA	12.00	36.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
716	231	SM0612-062042	SALIDA	4.00	26.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
717	238	SM0612-062049	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
718	245	SM0612-062057	SALIDA	6.00	18.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
719	247	SM0612-062059	SALIDA	7.00	17.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
720	248	SM0612-062060	SALIDA	8.00	16.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
721	250	SM0612-062061	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
722	251	SM0612-062062	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
723	265	SM0612-062401	SALIDA	4.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
724	267	SM0612-062403	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
725	268	SM0612-062404	SALIDA	2.00	4.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
726	273	SM0612-062409	SALIDA	7.00	5.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
727	304	SM0612-062441	SALIDA	16.00	20.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
728	310	SM0612-062447	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
729	311	SM0612-062448	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
730	312	SM0612-062449	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
731	313	SM0612-062450	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
732	314	SM0612-062451	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
733	315	SM0612-062452	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
734	316	SM0612-062453	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
735	317	SM0612-062454	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
736	318	SM0612-062455	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
737	239	SM0612-062051	SALIDA	4.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
738	256	SM0612-062101	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
739	257	SM0612-062102	SALIDA	10.00	8.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
740	262	SM0612-062107	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
741	263	SM0612-062108	SALIDA	6.00	4.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
742	264	SM0612-062109	SALIDA	12.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
743	331	SM0612-062113	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
744	332	SM0612-062114	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
745	334	SM0612-062116	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
746	335	SM0612-062117	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
747	336	SM0612-062118	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
748	337	SM0612-062119	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
749	339	SM0612-062121	SALIDA	10.00	122.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
750	340	SM0612-062122	SALIDA	10.00	8.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
751	348	SM0612-062130	SALIDA	8.00	10.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
752	349	SM0612-062131	SALIDA	12.00	12.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
753	157	SM0612-062349	SALIDA	6.00	25.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
754	204	SM0612-062015	SALIDA	4.00	8.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
755	207	SM0612-062018	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
756	215	SM0612-062026	SALIDA	6.00	4.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
757	216	SM0612-062027	SALIDA	5.00	1.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
758	218	SM0612-062029	SALIDA	6.00	12.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
759	225	SM0612-062036	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
760	227	SM0612-062038	SALIDA	13.00	23.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
761	232	SM0612-062043	SALIDA	6.00	24.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
762	233	SM0612-062044	SALIDA	4.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
763	245	SM0612-062057	SALIDA	6.00	12.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
764	246	SM0612-062058	SALIDA	3.00	22.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
765	247	SM0612-062059	SALIDA	6.00	11.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
766	248	SM0612-062060	SALIDA	9.00	7.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
767	256	SM0612-062101	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
768	257	SM0612-062102	SALIDA	4.00	4.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
769	262	SM0612-062107	SALIDA	5.00	1.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
770	263	SM0612-062108	SALIDA	2.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
771	264	SM0612-062109	SALIDA	2.00	1.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
772	331	SM0612-062113	SALIDA	4.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
773	332	SM0612-062114	SALIDA	4.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
774	334	SM0612-062116	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
775	335	SM0612-062117	SALIDA	1.00	5.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
776	336	SM0612-062118	SALIDA	4.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
777	337	SM0612-062119	SALIDA	5.00	1.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
778	339	SM0612-062121	SALIDA	10.00	112.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
779	344	SM0612-062126	SALIDA	6.00	12.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
780	345	SM0612-062127	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
781	346	SM0612-062128	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
782	347	SM0612-062129	SALIDA	6.00	12.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
783	348	SM0612-062130	SALIDA	6.00	4.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
784	349	SM0612-062131	SALIDA	9.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
785	266	SM0612-062402	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
786	269	SM0612-062405	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
787	302	SM0612-062439	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
788	303	SM0612-062440	SALIDA	5.00	1.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
789	304	SM0612-062441	SALIDA	6.00	14.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
790	305	SM0612-062442	SALIDA	6.00	18.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
791	309	SM0612-062446	SALIDA	4.00	8.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
792	310	SM0612-062447	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
793	311	SM0612-062448	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
794	312	SM0612-062449	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
795	313	SM0612-062450	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
796	314	SM0612-062451	SALIDA	5.00	1.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
797	315	SM0612-062452	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
798	316	SM0612-062453	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
799	317	SM0612-062454	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
800	319	SM0612-062456	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
801	320	SM0612-062457	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
802	321	SM0612-062461	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
803	161	SM0612-062201	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
804	162	SM0612-062202	SALIDA	23.00	1.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
805	163	SM0612-062203	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
806	164	SM0612-062204	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
807	165	SM0612-062205	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
808	166	SM0612-062206	SALIDA	30.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
809	167	SM0612-062207	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
810	168	SM0612-062208	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
811	169	SM0612-062209	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
812	170	SM0612-062210	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
813	171	SM0612-062211	SALIDA	8.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
814	172	SM0612-062212	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
815	173	SM0612-062213	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
816	174	SM0612-062214	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
817	175	SM0612-062215	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
818	176	SM0612-062216	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
819	177	SM0612-062217	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
820	178	SM0612-062218	SALIDA	42.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
821	179	SM0612-062219	SALIDA	42.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
822	180	SM0612-062220	SALIDA	42.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
823	265	SM0612-062401	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
824	266	SM0612-062402	SALIDA	2.00	4.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
825	268	SM0612-062404	SALIDA	4.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
826	270	SM0612-062406	SALIDA	1.00	11.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
827	272	SM0612-062408	SALIDA	2.00	10.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
828	273	SM0612-062409	SALIDA	5.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
829	290	SM0612-062426	SALIDA	1.00	5.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
830	303	SM0612-062440	SALIDA	1.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
831	304	SM0612-062441	SALIDA	12.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
832	305	SM0612-062442	SALIDA	2.00	16.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
833	306	SM0612-062443	SALIDA	50.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
834	307	SM0612-062444	SALIDA	50.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
835	308	SM0612-062445	SALIDA	50.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
836	309	SM0612-062446	SALIDA	3.00	5.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
837	314	SM0612-062451	SALIDA	1.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
838	317	SM0612-062454	SALIDA	1.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
839	318	SM0612-062455	SALIDA	1.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
840	322	SM0612-062458	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
841	323	SM0612-062459	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
842	324	SM0612-062460	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
843	181	SM0612-062221	SALIDA	42.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
844	182	SM0612-062222	SALIDA	42.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
845	183	SM0612-062223	SALIDA	42.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
846	184	SM0612-062224	SALIDA	42.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
847	185	SM0612-062225	SALIDA	42.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
848	186	SM0612-062226	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
849	187	SM0612-062227	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
850	188	SM0612-062228	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
851	189	SM0612-062229	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
852	110	SM0612-062301	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
853	111	SM0612-062302	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
854	257	SM0612-062102	SALIDA	4.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
855	258	SM0612-062103	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
856	191	SM0612-062002	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
857	192	SM0612-062003	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
858	259	SM0612-062104	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
859	260	SM0612-062105	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
860	261	SM0612-062106	SALIDA	13.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
861	262	SM0612-062107	SALIDA	1.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
862	263	SM0612-062108	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
863	264	SM0612-062109	SALIDA	1.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
864	328	SM0612-062110	SALIDA	1.00	5.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
865	329	SM0612-062111	SALIDA	42.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
866	330	SM0612-062112	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
867	331	SM0612-062113	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
868	332	SM0612-062114	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
869	333	SM0612-062115	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
870	335	SM0612-062117	SALIDA	5.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
871	336	SM0612-062118	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
872	337	SM0612-062119	SALIDA	1.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
873	338	SM0612-062120	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
874	339	SM0612-062121	SALIDA	2.00	110.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
875	340	SM0612-062122	SALIDA	1.00	7.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
876	341	SM0612-062123	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
877	342	SM0612-062124	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
878	112	SM0612-062303	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
879	113	SM0612-062304	SALIDA	10.00	26.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
880	114	SM0612-062305	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
881	115	SM0612-062306	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
882	116	SM0612-062307	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
883	117	SM0612-062308	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
884	118	SM0612-062309	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
885	119	SM0612-062310	SALIDA	25.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
886	120	SM0612-062311	SALIDA	25.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
887	121	SM0612-062312	SALIDA	30.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
888	122	SM0612-062313	SALIDA	36.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
889	123	SM0612-062314	SALIDA	30.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
890	124	SM0612-062315	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
891	125	SM0612-062316	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
892	343	SM0612-062125	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
893	344	SM0612-062126	SALIDA	1.00	11.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
894	346	SM0612-062128	SALIDA	1.00	5.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
895	347	SM0612-062129	SALIDA	2.00	10.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
896	348	SM0612-062130	SALIDA	1.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
897	349	SM0612-062131	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
898	350	SM0612-062132	SALIDA	4.00	8.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
899	351	SM0612-062133	SALIDA	4.00	8.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
900	352	SM0612-062134	SALIDA	4.00	8.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
901	353	SM0612-062135	SALIDA	4.00	8.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
902	354	SM0612-062136	SALIDA	48.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
903	190	SM0612-062001	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
904	193	SM0612-062004	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
905	194	SM0612-062005	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
906	195	SM0612-062006	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
907	209	SM0612-062020	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
908	210	SM0612-062021	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
909	211	SM0612-062022	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
910	126	SM0612-062317	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
911	127	SM0612-062318	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
912	128	SM0612-062319	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
913	129	SM0612-062320	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
914	130	SM0612-062321	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
915	131	SM0612-062322	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
916	132	SM0612-062323	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
917	133	SM0612-062324	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
918	134	SM0612-062325	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
919	135	SM0612-062326	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
920	196	SM0612-062007	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
921	197	SM0612-062008	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
922	198	SM0612-062009	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
923	201	SM0612-062012	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
924	202	SM0612-062013	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
925	203	SM0612-062014	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
926	204	SM0612-062015	SALIDA	5.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
927	160	SM0612-062352	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
928	206	SM0612-062017	SALIDA	1.00	5.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
929	207	SM0612-062018	SALIDA	1.00	5.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
930	215	SM0612-062026	SALIDA	1.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
931	216	SM0612-062027	SALIDA	1.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
932	220	SM0612-062031	SALIDA	1.00	5.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
933	232	SM0612-062043	SALIDA	1.00	23.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
934	233	SM0612-062044	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
935	239	SM0612-062051	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
936	242	SM0612-062054	SALIDA	2.00	10.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
937	246	SM0612-062058	SALIDA	1.00	21.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
938	255	SM0612-062066	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
939	136	SM0612-062327	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
940	137	SM0612-062328	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
941	138	SM0612-062329	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
942	139	SM0612-062330	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
943	140	SM0612-062331	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
944	141	SM0612-062332	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
945	142	SM0612-062333	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
946	143	SM0612-062334	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
947	144	SM0612-062335	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
948	221	SM0612-062032	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
949	222	SM0612-062033	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
950	223	SM0612-062034	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
951	227	SM0612-062038	SALIDA	13.00	10.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
952	228	SM0612-062039	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
953	234	SM0612-062045	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
954	235	SM0612-062046	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
955	236	SM0612-062047	SALIDA	11.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
956	237	SM0612-062048	SALIDA	12.00	1.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
957	145	SM0612-062336	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
958	146	SM0612-062337	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
959	147	SM0612-062338	SALIDA	10.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
960	148	SM0612-062339	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
961	149	SM0612-062340	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
962	150	SM0612-062341	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
963	151	SM0612-062342	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
964	152	SM0612-062344	SALIDA	18.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
965	153	SM0612-062345	SALIDA	19.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
966	154	SM0612-062346	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
967	155	SM0612-062347	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
968	156	SM0612-062348	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
969	157	SM0612-062349	SALIDA	4.00	21.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
970	158	SM0612-062350	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
971	159	SM0612-062351	SALIDA	24.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
972	214	SM0612-062025	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
973	218	SM0612-062029	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
974	224	SM0612-062035	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
975	226	SM0612-062037	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
976	240	SM0612-062052	SALIDA	6.00	18.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
977	241	SM0612-062053	SALIDA	3.00	9.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
978	243	SM0612-062055	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
979	244	SM0612-062056	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
980	245	SM0612-062057	SALIDA	5.00	7.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
981	247	SM0612-062059	SALIDA	2.00	9.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
982	248	SM0612-062060	SALIDA	3.00	4.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
983	249	SM0612-062067	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
984	250	SM0612-062061	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
985	252	SM0612-062063	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
986	254	SM0612-062065	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
987	113	SM0612-062304	SALIDA	15.00	11.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
988	157	SM0612-062349	SALIDA	9.00	12.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
989	162	SM0612-062202	SALIDA	1.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
990	200	SM0612-062011	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
991	205	SM0612-062016	SALIDA	12.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
992	206	SM0612-062017	SALIDA	5.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
993	207	SM0612-062018	SALIDA	5.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
994	208	SM0612-062019	SALIDA	8.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
995	212	SM0612-062023	SALIDA	3.00	12.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
996	213	SM0612-062024	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
997	215	SM0612-062026	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
998	217	SM0612-062028	SALIDA	5.00	1.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
999	218	SM0612-062029	SALIDA	3.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1000	219	SM0612-062030	SALIDA	6.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1001	220	SM0612-062031	SALIDA	3.00	2.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1002	227	SM0612-062038	SALIDA	10.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1003	231	SM0612-062042	SALIDA	10.00	16.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1004	241	SM0612-062053	SALIDA	6.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1005	242	SM0612-062054	SALIDA	6.00	4.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1006	245	SM0612-062057	SALIDA	7.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1007	246	SM0612-062058	SALIDA	9.00	12.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1008	248	SM0612-062060	SALIDA	4.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1009	328	SM0612-062110	SALIDA	5.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1010	339	SM0612-062121	SALIDA	24.00	86.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1011	340	SM0612-062122	SALIDA	4.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1012	345	SM0612-062127	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1013	346	SM0612-062128	SALIDA	5.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1014	347	SM0612-062129	SALIDA	6.00	4.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1015	353	SM0612-062135	SALIDA	5.00	3.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1016	266	SM0612-062402	SALIDA	4.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1017	270	SM0612-062406	SALIDA	11.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1018	275	SM0612-062411	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1019	278	SM0612-062414	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1020	280	SM0612-062416	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1021	293	SM0612-062429	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1022	301	SM0612-062438	SALIDA	6.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1023	304	SM0612-062441	SALIDA	2.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1024	305	SM0612-062442	SALIDA	10.00	6.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1025	309	SM0612-062446	SALIDA	5.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1026	319	SM0612-062456	SALIDA	3.00	0.00	NOTA_SALIDA	00000029	32	\N	2026-05-29 17:54:09.351306
1987	583	4100272	SALIDA	5.00	0.00	NOTA_SALIDA	00000034	37	\N	2026-06-04 21:47:41.168864
1988	584	I3455577	SALIDA	8.00	0.00	NOTA_SALIDA	00000034	37	\N	2026-06-04 21:47:41.168864
1989	42	K3371732	SALIDA	10.00	0.00	NOTA_SALIDA	00000034	37	\N	2026-06-04 21:47:41.168864
1990	43	K3396584	SALIDA	20.00	0.00	NOTA_SALIDA	00000034	37	\N	2026-06-04 21:47:41.168864
2035	792	784828	INGRESO	1.00	1.00	NOTA_INGRESO	00000032	34	\N	2026-06-11 15:32:06.363193
2036	793	504/25	INGRESO	9.00	9.00	NOTA_INGRESO	00000032	34	\N	2026-06-11 15:32:06.363193
2037	794	566/24	INGRESO	9.00	9.00	NOTA_INGRESO	00000032	34	\N	2026-06-11 15:32:06.363193
2069	788	304190	SALIDA	1.00	0.00	NOTA_SALIDA	00000043	46	\N	2026-06-11 21:59:42.18769
2299	622	MVC14	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2300	619	MVC16	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2301	620	MVC17	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2302	696	MVC18	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2303	695	MVC19	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2304	618	MVC19	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2305	621	MVC19	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2306	697	PMTDF50	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2307	628	PMTDF57	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2308	629	PMTDF61	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2309	699	PMTDF62	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2310	625	PMTDF65	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2311	698	PMTDF66	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2312	626	PMTDF67	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2313	627	PMTDF68	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2314	633	PMTVC81	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2315	633	PMTVD19	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2316	635	PMTVD21	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2317	634	PMTVD24	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2318	636	PMTVD25	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2319	634	PMTVD27	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2320	631	PPHTC72	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
1991	757	13500000002507024820	INGRESO	1.00	1.00	NOTA_INGRESO	00000020	21	\N	2026-06-10 15:28:56.24014
1992	758	13500000002507024821	INGRESO	1.00	1.00	NOTA_INGRESO	00000020	21	\N	2026-06-10 15:28:56.24014
1993	759	13500000002507024822	INGRESO	1.00	1.00	NOTA_INGRESO	00000020	21	\N	2026-06-10 15:28:56.24014
1994	760	13500000002507024823	INGRESO	1.00	1.00	NOTA_INGRESO	00000020	21	\N	2026-06-10 15:28:56.24014
1995	761	13500000002507024824	INGRESO	1.00	1.00	NOTA_INGRESO	00000020	21	\N	2026-06-10 15:28:56.24014
1996	762	13500000002507024825	INGRESO	1.00	1.00	NOTA_INGRESO	00000020	21	\N	2026-06-10 15:28:56.24014
1997	763	13500000002507024826	INGRESO	1.00	1.00	NOTA_INGRESO	00000020	21	\N	2026-06-10 15:28:56.24014
1998	764	13500000002507024827	INGRESO	1.00	1.00	NOTA_INGRESO	00000020	21	\N	2026-06-10 15:28:56.24014
2070	783	H122	SALIDA	6.00	0.00	NOTA_SALIDA	00000044	47	\N	2026-06-11 22:06:13.784224
2071	784	G238	SALIDA	3.00	0.00	NOTA_SALIDA	00000044	47	\N	2026-06-11 22:06:13.784224
2072	785	AAB	SALIDA	3.00	0.00	NOTA_SALIDA	00000044	47	\N	2026-06-11 22:06:13.784224
2073	769	G185	SALIDA	3.00	12.00	NOTA_SALIDA	00000044	47	\N	2026-06-11 22:06:13.784224
2074	772	H129	SALIDA	3.00	4.00	NOTA_SALIDA	00000044	47	\N	2026-06-11 22:06:13.784224
2075	786	G185	SALIDA	3.00	0.00	NOTA_SALIDA	00000044	47	\N	2026-06-11 22:06:13.784224
2076	770	G222	SALIDA	3.00	3.00	NOTA_SALIDA	00000044	47	\N	2026-06-11 22:06:13.784224
2077	768	G291	SALIDA	3.00	3.00	NOTA_SALIDA	00000044	47	\N	2026-06-11 22:06:13.784224
2321	632	PVLDCK19	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2322	632	PVLDCK20	INGRESO	17.00	17.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2323	707	S23F1F104A	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2325	686	5080571	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2326	692	20231007	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2327	752	202504042	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2328	694	H3318717	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2331	683	S25TZAJYAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2332	672	S25TZAOCAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2333	701	2510227448	INGRESO	200.00	200.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2334	702	2510227458	INGRESO	450.00	450.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2335	703	2510227459	INGRESO	600.00	600.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2336	700	2510227462	INGRESO	300.00	300.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2337	707	S23F1F104A	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2340	701	2510227448	INGRESO	200.00	200.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2341	702	2510227458	INGRESO	450.00	450.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2342	703	2510227459	INGRESO	600.00	600.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2343	700	2510227462	INGRESO	300.00	300.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2344	725	24A643	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2345	724	25A107	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2346	720	25A251	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2347	726	25A553	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2348	727	25A554	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2349	721	25A558	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2350	722	25A574	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2351	723	25A575	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2352	686	5032071	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2353	686	5080571	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2354	694	H3318717	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2360	707	S23F1F104A	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2361	686	5032071	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2362	686	5080571	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2363	689	2309-0232	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2364	708	250411A101	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2365	706	E4747855	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2366	706	E4747855	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2367	705	H3201753	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2368	733	H3283983	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2369	733	H3283983	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2371	704	I3192257	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2373	687	I3232620	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2375	707	S23F1F104A	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2376	689	2309-0232	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2377	728	LE240966	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2324	883	K3242383	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
1999	765	560038-M25910830007	INGRESO	1.00	1.00	NOTA_INGRESO	00000021	22	\N	2026-06-10 16:43:16.751961
2040	797	MO14100167	INGRESO	2.00	2.00	NOTA_INGRESO	00000034	36	\N	2026-06-11 19:44:50.177638
2041	798	MO14060356	INGRESO	1.00	1.00	NOTA_INGRESO	00000034	36	\N	2026-06-11 19:44:50.177638
2078	101	202507V	SALIDA	1.00	5.00	NOTA_SALIDA	00000045	48	\N	2026-06-12 19:48:29.676502
2378	707	S23F1F104A	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2379	729	S25A1A101A	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2380	702	2510227458	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2381	703	2510227459	INGRESO	17.00	17.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2382	700	2510227462	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2383	666	S25TZALWAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2384	592	EFG94	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2385	586	EFG99	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2386	587	EFH05	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2387	588	EFH06	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2388	590	EFH06	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2389	589	EFH07	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2390	595	EFH10	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2391	591	EFH17	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2392	710	EFH18	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2393	585	EFH23	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2394	593	EFH23	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2395	612	EFH26	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2396	596	EFH39	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2397	603	EFH40	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2398	615	EFH41	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2399	615	EFH42	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2400	597	EFH43	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2401	598	EFH43	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2402	709	EFH44	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2403	601	EFH44	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2404	604	EFH44	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2405	594	EFH45	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2406	609	EFH45	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2407	610	EFH45	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2408	606	EFH47	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2409	607	EFH48	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2410	616	EFH48	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2411	602	EFH50	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2412	616	EFH51	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2413	712	EFH51	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2414	593	EFH53	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2415	617	EFH56	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2416	711	EFH56	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2417	599	EFH59	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2418	600	EFH59	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2419	605	EFH60	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2420	613	EFH62	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2421	608	EFH63	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2422	611	EFH63	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2423	614	EFH64	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2424	623	MVC08	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2425	622	MVC18	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2426	695	MVC19	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2427	624	MVC19	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2428	619	MVC20	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2429	696	MVC21	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2430	621	MVC21	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2431	618	MVC22	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2432	620	MVC23	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2433	628	PMTDF57	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2434	630	PMTDF59	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2435	629	PMTDF61	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2436	697	PMTDF63	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2437	699	PMTDF65	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2438	698	PMTDF66	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2439	627	PMTDF68	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2440	626	PMTDF69	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2441	698	PMTDF69	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2442	625	PMTDF70	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2443	633	PMTVD19	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2444	636	PMTVD29	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2445	635	PMTVD31	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2446	634	PMTVD34	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2447	637	POBC24	INGRESO	21.00	21.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2448	637	POBC25	INGRESO	39.00	39.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2000	104	AAWAN11EX	INGRESO	5.00	5.00	NOTA_INGRESO	00000022	23	\N	2026-06-10 16:52:13.68057
2001	105	MAVLX03EX	INGRESO	5.00	5.00	NOTA_INGRESO	00000022	23	\N	2026-06-10 16:52:13.68057
2002	766	DFRVCA11	INGRESO	1.00	1.00	NOTA_INGRESO	00000022	23	\N	2026-06-10 16:52:13.68057
2042	799	CR-3C275446	INGRESO	1.00	1.00	NOTA_INGRESO	00000035	37	\N	2026-06-11 20:05:38.266809
2043	800	CR-3C275447	INGRESO	1.00	1.00	NOTA_INGRESO	00000035	37	\N	2026-06-11 20:05:38.266809
2079	787	407688	SALIDA	1.00	0.00	NOTA_SALIDA	00000046	49	\N	2026-06-12 19:53:20.388098
2080	799	CR-3C275446	SALIDA	1.00	0.00	NOTA_SALIDA	00000046	49	\N	2026-06-12 19:53:20.388098
2081	800	CR-3C275447	SALIDA	1.00	0.00	NOTA_SALIDA	00000046	49	\N	2026-06-12 19:53:20.388098
2082	101	202507V	SALIDA	2.00	3.00	NOTA_SALIDA	00000046	49	\N	2026-06-12 19:53:20.388098
2449	638	POBC35	INGRESO	20.00	20.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2450	631	PPHTC79	INGRESO	28.00	28.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2451	632	PVLDCK25	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2452	730	250409A051	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2453	708	250411A101	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2454	682	S25TZAJPAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2455	731	2501-0324	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2456	737	BLS457250201	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2457	728	LE240966	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2458	732	S25A1A101A	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2459	729	S25A1A101A	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2462	700	2510227462	INGRESO	12.00	12.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2463	628	PMTDF57	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2464	630	PMTDF59	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2465	629	PMTDF61	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2466	699	PMTDF65	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2467	698	PMTDF66	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2468	627	PMTDF68	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2469	698	PMTDF69	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2470	633	PMTVD19	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2471	636	PMTVD29	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2472	635	PMTVD31	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2473	634	PMTVD34	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2474	631	PPHTC79	INGRESO	28.00	28.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2475	632	PVLDCK25	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2476	592	EFG94	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2477	586	EFG99	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2478	587	EFH05	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2479	588	EFH06	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2480	590	EFH06	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2481	589	EFH07	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2482	595	EFH10	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2483	591	EFH17	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2484	710	EFH18	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2485	585	EFH23	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2486	593	EFH23	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2487	612	EFH26	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2488	596	EFH39	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2489	603	EFH40	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2490	615	EFH41	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2491	615	EFH42	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2492	597	EFH43	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2493	598	EFH43	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2494	709	EFH44	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2495	601	EFH44	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2496	604	EFH44	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2497	594	EFH45	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2498	609	EFH45	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2499	610	EFH45	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2500	606	EFH47	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2501	607	EFH48	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2502	616	EFH48	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2503	602	EFH50	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2504	616	EFH51	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2505	712	EFH51	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2506	593	EFH53	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2507	617	EFH56	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2508	711	EFH56	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2509	599	EFH59	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2510	600	EFH59	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2511	605	EFH60	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2512	613	EFH62	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2513	608	EFH63	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2514	611	EFH63	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2003	767	F1010W1E00D	INGRESO	20.00	20.00	NOTA_INGRESO	00000023	24	\N	2026-06-10 17:59:42.257729
2044	801	251210	INGRESO	4.00	4.00	NOTA_INGRESO	00000036	38	\N	2026-06-11 20:13:30.581808
2083	768	G291	SALIDA	3.00	0.00	NOTA_SALIDA	00000047	50	\N	2026-06-12 20:03:33.58986
2084	781	G291	SALIDA	1.00	0.00	NOTA_SALIDA	00000047	50	\N	2026-06-12 20:03:33.58986
2085	769	G185	SALIDA	12.00	0.00	NOTA_SALIDA	00000047	50	\N	2026-06-12 20:03:33.58986
2086	782	G122	SALIDA	3.00	0.00	NOTA_SALIDA	00000047	50	\N	2026-06-12 20:03:33.58986
2087	770	G222	SALIDA	3.00	0.00	NOTA_SALIDA	00000047	50	\N	2026-06-12 20:03:33.58986
2088	771	D231	SALIDA	12.00	0.00	NOTA_SALIDA	00000047	50	\N	2026-06-12 20:03:33.58986
2089	772	H129	SALIDA	4.00	0.00	NOTA_SALIDA	00000047	50	\N	2026-06-12 20:03:33.58986
2090	773	H131	SALIDA	12.00	0.00	NOTA_SALIDA	00000047	50	\N	2026-06-12 20:03:33.58986
2091	797	MO14100167	SALIDA	2.00	0.00	NOTA_SALIDA	00000047	50	\N	2026-06-12 20:03:33.58986
2515	614	EFH64	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2516	623	MVC08	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2517	622	MVC18	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2518	695	MVC19	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2519	624	MVC19	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2520	619	MVC20	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2521	696	MVC21	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2522	621	MVC21	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2523	618	MVC22	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2524	620	MVC23	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2525	697	PMTDF63	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2526	626	PMTDF69	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2527	625	PMTDF70	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2528	637	POBC24	INGRESO	21.00	21.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2529	637	POBC25	INGRESO	39.00	39.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2530	638	POBC35	INGRESO	20.00	20.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2531	713	202511609	INGRESO	300.00	300.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2532	714	202512604	INGRESO	1200.00	1200.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2533	738	2024110201IF	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2534	737	BLS457250201	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2535	686	5080571	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2538	702	2510227458	INGRESO	9.00	9.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2539	703	2510227459	INGRESO	9.00	9.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2540	700	2510227462	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2541	689	2309-0232	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2542	725	24A643	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2543	731	2501-0324	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2544	731	2501-0324	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2545	730	250409A051	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2546	708	250411A101	INGRESO	11.00	11.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2547	724	25A107	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2548	720	25A251	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2549	726	25A553	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2550	727	25A554	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2551	721	25A558	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2552	723	25A575	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2553	706	E4747855	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2554	705	H3201753	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2555	733	H3283983	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2556	687	I3232620	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2557	728	LE240966	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2558	728	LE240966	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2559	729	S25A1A101A	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2560	732	S25A1A101A	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2561	729	S25A1A101A	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2562	685	S25TZALPAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2563	674	S25TZARPAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2570	741	24A361	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2571	725	24A643	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2572	720	25A251	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2573	724	25A552	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2574	726	25A553	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2575	721	25A558	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2576	743	25A567	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2577	739	25A572	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2578	742	25A725	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2004	768	G222	INGRESO	1.00	1.00	NOTA_INGRESO	00000024	25	\N	2026-06-10 18:30:57.695335
2005	769	G185	INGRESO	2.00	2.00	NOTA_INGRESO	00000024	25	\N	2026-06-10 18:30:57.695335
2006	770	G222	INGRESO	2.00	2.00	NOTA_INGRESO	00000024	25	\N	2026-06-10 18:30:57.695335
2007	771	D231	INGRESO	2.00	2.00	NOTA_INGRESO	00000024	25	\N	2026-06-10 18:30:57.695335
2008	772	H129	INGRESO	2.00	2.00	NOTA_INGRESO	00000024	25	\N	2026-06-10 18:30:57.695335
2009	773	H121	INGRESO	2.00	2.00	NOTA_INGRESO	00000024	25	\N	2026-06-10 18:30:57.695335
2010	774	F229	INGRESO	1.00	1.00	NOTA_INGRESO	00000024	25	\N	2026-06-10 18:30:57.695335
2011	774	D129	INGRESO	1.00	1.00	NOTA_INGRESO	00000024	25	\N	2026-06-10 18:30:57.695335
2045	765	560038-M25910830007	SALIDA	1.00	0.00	NOTA_SALIDA	00000035	38	\N	2026-06-11 21:13:56.04266
2046	764	13500000002507024827	SALIDA	1.00	0.00	NOTA_SALIDA	00000035	38	\N	2026-06-11 21:13:56.04266
2047	763	13500000002507024826	SALIDA	1.00	0.00	NOTA_SALIDA	00000035	38	\N	2026-06-11 21:13:56.04266
2048	762	13500000002507024825	SALIDA	1.00	0.00	NOTA_SALIDA	00000035	38	\N	2026-06-11 21:13:56.04266
2049	761	13500000002507024824	SALIDA	1.00	0.00	NOTA_SALIDA	00000035	38	\N	2026-06-11 21:13:56.04266
2050	760	13500000002507024823	SALIDA	1.00	0.00	NOTA_SALIDA	00000035	38	\N	2026-06-11 21:13:56.04266
2051	759	13500000002507024822	SALIDA	1.00	0.00	NOTA_SALIDA	00000035	38	\N	2026-06-11 21:13:56.04266
2052	758	13500000002507024821	SALIDA	1.00	0.00	NOTA_SALIDA	00000035	38	\N	2026-06-11 21:13:56.04266
2053	757	13500000002507024820	SALIDA	1.00	0.00	NOTA_SALIDA	00000035	38	\N	2026-06-11 21:13:56.04266
2092	768	G222	SALIDA	1.00	0.00	NOTA_SALIDA	00000048	51	\N	2026-06-12 20:09:12.707425
2093	769	G185	SALIDA	2.00	0.00	NOTA_SALIDA	00000048	51	\N	2026-06-12 20:09:12.707425
2094	770	G222	SALIDA	2.00	0.00	NOTA_SALIDA	00000048	51	\N	2026-06-12 20:09:12.707425
2095	771	D231	SALIDA	2.00	0.00	NOTA_SALIDA	00000048	51	\N	2026-06-12 20:09:12.707425
2096	774	F229	SALIDA	1.00	0.00	NOTA_SALIDA	00000048	51	\N	2026-06-12 20:09:12.707425
2097	774	D129	SALIDA	1.00	0.00	NOTA_SALIDA	00000048	51	\N	2026-06-12 20:09:12.707425
2098	773	H121	SALIDA	2.00	0.00	NOTA_SALIDA	00000048	51	\N	2026-06-12 20:09:12.707425
2099	776	202503027	SALIDA	10.00	0.00	NOTA_SALIDA	00000048	51	\N	2026-06-12 20:09:12.707425
2100	772	H129	SALIDA	2.00	0.00	NOTA_SALIDA	00000048	51	\N	2026-06-12 20:09:12.707425
2579	740	25A763	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2580	685	P25TZAFIAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2581	662	S25TZAFLAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2582	659	S25TZALJAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2583	650	S25TZANRAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2584	713	202511609	INGRESO	45.00	45.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2585	714	202512604	INGRESO	100.00	100.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2586	728	LE240966	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2587	707	S23F1F104A	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2588	729	S25A1A101A	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2595	714	202512604	INGRESO	20.00	20.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2596	607	EFH48	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2597	703	2510227459	INGRESO	210.00	210.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2598	738	2024110201IF	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2599	737	BLS457250201	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2600	729	S25A1A101A	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2601	702	2510227458	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2602	703	2510227459	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2603	656	P25TZAEZAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2604	685	P25TZAFIAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2605	662	P25TZAFLAA	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2606	648	P25TZAFWAA	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2607	669	P25TZAFXAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2608	655	P25TZAGBAB	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2609	661	P25TZAGDAB	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2610	645	P25TZAGGAD	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2611	670	P25TZAGRAF	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2612	643	P25TZAGYAD	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2613	680	P25TZAHLAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2614	682	S25TZAJPAB	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2615	683	S25TZAJYAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2616	682	S25TZAKHAC	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2617	659	S25TZALJAC	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2618	666	S25TZALWAB	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2619	644	S25TZAMAAB	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2620	646	S25TZAMXAD	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2621	649	S25TZAMZAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2622	665	S25TZANGAA	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2623	668	S25TZANGAA	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2624	683	S25TZANIAA	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2625	650	S25TZANRAA	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2626	657	S25TZAOAAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2012	775	F0331X3F00D	INGRESO	20.00	20.00	NOTA_INGRESO	00000025	26	\N	2026-06-10 20:14:49.390947
2054	104	AAWAN11EX	SALIDA	5.00	0.00	NOTA_SALIDA	00000036	39	\N	2026-06-11 21:16:11.028328
2055	105	MAVLX03EX	SALIDA	5.00	0.00	NOTA_SALIDA	00000036	39	\N	2026-06-11 21:16:11.028328
2101	777	H25B00450463	SALIDA_REVERSA	-1.00	1.00	NOTA_SALIDA_CANCELADA	00000042	45	\N	2026-06-12 20:16:25.765786
2102	778	360101-M25C09810051	SALIDA_REVERSA	-1.00	1.00	NOTA_SALIDA_CANCELADA	00000042	45	\N	2026-06-12 20:16:25.765786
2627	672	S25TZAOCAC	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2628	671	S25TZAOIAB	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2629	676	S25TZAOLAB	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2630	658	S25TZAOOAA	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2631	653	S25TZAOZAB	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2632	651	S25TZAPAAC	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2633	678	S25TZAPGAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2634	679	S25TZAPGAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2635	681	S25TZAPJAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2636	647	S25TZAPKAA	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2637	652	S25TZAPKAA	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2638	667	S25TZAPPAB	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2639	664	S25TZAPTAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2640	654	S25TZAPYAA	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2641	681	S25TZAQOAB	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2642	681	S25TZAQSAA	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2643	675	S25TZARIAE	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2644	673	S25TZARJAC	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2645	660	S25TZARNAC	INGRESO	9.00	9.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2646	674	S25TZARPAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2647	680	S25TZARQAE	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2648	663	S25TZARYAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2649	642	S25TZASCAL	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2650	640	S25TZASDAB	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2651	641	S25TZASDAJ	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2652	684	S25TZASMAC	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2653	684	S25TZATHAD	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2654	677	S25TZAUAAG	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2655	639	S25TZAUFAG	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2656	714	202512604	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2657	622	MVC21	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2658	622	MVC21	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2659	621	MVC25	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2660	621	MVC25	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2661	696	MVC26	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2662	624	MVC26	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2663	696	MVC26	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2664	624	MVC26	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2665	695	MVC27	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2666	620	MVC27	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2667	695	MVC27	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2668	620	MVC27	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2669	618	MVC28	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2670	618	MVC28	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2671	628	PMTDF63	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2672	628	PMTDF63	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2673	630	PMTDF70	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2674	630	PMTDF70	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2675	699	PMTDF71	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2676	699	PMTDF71	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2677	627	PMTDF73	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2678	627	PMTDF73	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2679	697	PMTDF74	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2680	698	PMTDF74	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2681	697	PMTDF74	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2682	698	PMTDF74	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2683	625	PMTDF80	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2684	625	PMTDF80	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2685	633	PMTVD23	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2686	633	PMTVD23	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2687	636	PMTVD35	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2688	636	PMTVD35	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2689	635	PMTVD37	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2690	635	PMTVD37	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2691	634	PMTVD40	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2692	634	PMTVD40	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2693	631	PPHTC88	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2694	631	PPHTC88	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2695	632	PVLDCK38	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2696	632	PVLDCK38	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2013	776	202503027	INGRESO	10.00	10.00	NOTA_INGRESO	00000026	27	\N	2026-06-10 20:23:32.168744
2056	766	DFRVCA11	SALIDA	1.00	0.00	NOTA_SALIDA	00000037	40	\N	2026-06-11 21:22:26.778848
2057	775	F0331X3F00D	SALIDA	19.00	1.00	NOTA_SALIDA	00000037	40	\N	2026-06-11 21:22:26.778848
2103	777	H25B00450463	SALIDA	1.00	0.00	NOTA_SALIDA	00000049	52	\N	2026-06-12 20:17:20.965928
2697	642	S25TZALOAJ	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2698	653	S25TZAMAAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2699	680	S25TZANFAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2700	641	S25TZAONAF	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2701	643	S25TZAQWAF	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2702	680	S25TZASCAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2703	684	S25TZASMAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2705	736	250624	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2706	735	250625	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2707	734	S23E1E111A	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2708	619	MVC20	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2709	626	PMTDF69	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2710	707	S23F1F104A	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2711	714	202512604	INGRESO	100.00	100.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2712	744	2025112601IF	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2713	737	BLS457250201	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2714	707	S23F1F104A	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2715	747	251219A191	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2716	745	251224A021	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2717	746	251224A041	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2718	748	S25F1F102A	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2719	731	2501-0324	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2720	607	EFH48	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2721	707	S23F1F104A	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2722	748	S25F1F102A	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2723	750	250516	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2724	751	250623	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2725	749	250723	INGRESO	50.00	50.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2726	624	MVC11	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2727	624	MVC19	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2728	630	PMTDF59	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2730	752	202504042	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2731	624	MVC19	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2732	621	MVC21	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2733	620	MVC23	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2734	630	PMTDF59	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2735	627	PMTDF68	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2736	631	PPHTC79	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2737	632	PVLDCK14	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2738	632	PVLDCK25	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2739	753	2510227457	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2740	754	2510227461	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2741	755	2510227463	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2742	756	2510227466	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2743	802	2510227467	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2744	803	2510227468	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2745	804	2510227469	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2746	805	2510227470	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2747	806	2510227471	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2748	807	2510227472	INGRESO	50.00	50.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2749	808	2510227473	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2750	809	2510227474	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2751	810	2510227475	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2752	811	2510227476	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2753	812	2510227477	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2754	813	2510227478	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2755	814	2510227479	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2756	815	2510227480	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2757	816	2510227481	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2758	817	2510227482	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2759	818	2510227483	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2760	819	2510227484	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2761	820	2510227485	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2762	821	2510227486	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2763	822	2510227487	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2764	823	2510227488	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2765	824	2510227489	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2766	825	2510227490	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2767	826	2510227491	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2014	777	H25B00450463	INGRESO	1.00	1.00	NOTA_INGRESO	00000027	28	\N	2026-06-10 20:32:08.783673
2015	778	360101-M25C09810051	INGRESO	1.00	1.00	NOTA_INGRESO	00000027	28	\N	2026-06-10 20:32:08.783673
2058	767	F1010W1E00D	SALIDA	20.00	0.00	NOTA_SALIDA	00000038	41	\N	2026-06-11 21:31:35.905996
2059	780	1045824328	SALIDA	96.00	0.00	NOTA_SALIDA	00000038	41	\N	2026-06-11 21:31:35.905996
2104	778	360101-M25C09810051	SALIDA	1.00	0.00	NOTA_SALIDA	00000050	53	\N	2026-06-12 20:24:25.622632
2768	827	2510227492	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2769	828	2510227493	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2770	829	2510227494	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2771	830	2510227495	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2772	831	2510227496	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2773	700	2601300575	INGRESO	160.00	160.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2774	622	MVC18	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2775	628	PMTDF57	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2776	832	9952785	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2777	832	10094788	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2778	619	MVC16	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2779	620	MVC27	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2780	626	PMTDF67	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2781	698	PMTDF74	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2782	642	S25TZALOAJ	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2783	647	S25TZAPKAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2784	619	MVC13	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2785	622	MVC14	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2786	626	PMTDF52	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2787	628	PMTDF57	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2788	833	250403A261	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2789	695	MVC19	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2790	697	PMTDF63	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2791	697	PMTDF63	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2792	731	2501-0324	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2801	632	PVLDCK25	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2805	643	P25TZAQWAF	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2806	729	S25A1A101A	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2807	653	S25TZAMAAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2808	639	S25TZAOJAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2809	626	PMTDF69	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2813	717	202603608	INGRESO	600.00	600.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2814	619	MVC13	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2815	626	PMTDF52	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2816	714	202512604	INGRESO	100.00	100.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2817	744	2025112601IF	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2818	834	SL240047	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2819	736	250624	INGRESO	30.00	30.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2820	835	2603201425	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2821	753	2603201426	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2822	754	2603201432	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2823	755	2603201437	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2824	756	2603201444	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2825	802	2603201453	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2826	803	2603201456	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2827	804	2603201457	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2828	804	2603201457	INGRESO	15.00	15.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2829	805	2603201459	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2830	806	2603201470	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2831	808	2603201479	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2832	809	2603201481	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2833	810	2603201484	INGRESO	17.00	17.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2834	811	2603201494	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2835	812	2603201495	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2836	813	2603201503	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2837	814	2603201509	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2016	779	URS5070060	INGRESO	10.00	10.00	NOTA_INGRESO	00000028	29	\N	2026-06-10 20:41:25.305129
2060	793	504/25	SALIDA	9.00	0.00	NOTA_SALIDA	00000039	42	\N	2026-06-11 21:33:38.610396
2061	794	566/24	SALIDA	9.00	0.00	NOTA_SALIDA	00000039	42	\N	2026-06-11 21:33:38.610396
2105	60	241189400	SALIDA	72.00	0.00	NOTA_SALIDA	00000051	54	\N	2026-06-12 21:26:49.535622
2106	52	2511090101	SALIDA	99.00	0.00	NOTA_SALIDA	00000051	54	\N	2026-06-12 21:26:49.535622
2107	56	2510067901	SALIDA	180.00	0.00	NOTA_SALIDA	00000051	54	\N	2026-06-12 21:26:49.535622
2108	77	2511022701	SALIDA	30.00	0.00	NOTA_SALIDA	00000051	54	\N	2026-06-12 21:26:49.535622
2109	76	2506268201	SALIDA	16.00	0.00	NOTA_SALIDA	00000051	54	\N	2026-06-12 21:26:49.535622
2110	62	2403049101	SALIDA	16.00	0.00	NOTA_SALIDA	00000051	54	\N	2026-06-12 21:26:49.535622
2838	815	2603201514	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2839	816	2603201515	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2840	817	2603201521	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2841	819	2603201522	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2842	820	2603201530	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2843	821	2603201533	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2844	822	2603201536	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2845	823	2603201544	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2846	836	2603201545	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2847	824	2603201546	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2848	825	2603201547	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2849	826	2603201550	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2850	837	2603201551	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2851	827	2603201552	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2852	828	2603201554	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2853	829	2603201555	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2854	830	2603201556	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2855	831	2603201557	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2856	706	E4747855	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2857	838	2310-0379	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2864	622	MVC10	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2865	628	PMTDF57	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2866	834	SL240047	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2869	839	241111A011	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2870	623	MVC08	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2871	629	PMTDF61	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2872	840	2405-0167	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2873	624	MVC19	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2874	630	PMTDF59	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2875	619	MVC13	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2876	626	PMTDF52	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2877	623	MVB85	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2878	622	MVC21	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2879	619	MVC24	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2880	620	MVC25	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2881	629	PMTDF26	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2882	841	PMTDF63	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2883	698	PMTDF73	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2884	626	PMTDF76	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2885	633	PMTVD14	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2886	634	PMTVD36	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2887	635	PMTVD37	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2888	631	PPHTC61	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2889	632	PVLDCK13	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2890	708	251224A061	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2891	746	251224A291	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2892	842	260327A121	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2893	744	2025112601IF	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2894	707	S23F1F104A	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2895	750	250516	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2896	751	250923	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2897	736	251022	INGRESO	55.00	55.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2898	700	2604227464	INGRESO	500.00	500.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2899	843	20260109R	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2900	713	202604635	INGRESO	200.00	200.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2901	717	202604636	INGRESO	500.00	500.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2902	622	MVC41	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2903	620	MVC44	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2017	780	1045824328	INGRESO	96.00	96.00	NOTA_INGRESO	00000029	30	\N	2026-06-10 21:05:23.498032
2062	795	775080	INGRESO	2.00	2.00	NOTA_INGRESO	00000033	35	\N	2026-06-11 21:39:11.381521
2063	796	0000072163	INGRESO	1.00	1.00	NOTA_INGRESO	00000033	35	\N	2026-06-11 21:39:11.381521
2111	58	2511014801	SALIDA	54.00	0.00	NOTA_SALIDA	00000052	55	\N	2026-06-12 21:38:00.451488
2904	696	MVC45	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2905	619	MVC45	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2906	621	MVC46	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2907	621	MVC49	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2908	620	MVC51	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2909	628	PMTDF85	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2910	844	PMTDF89	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2911	627	PMTDF91	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2912	698	PMTDF93	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2913	626	PMTDF94	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2914	698	PMTDF96	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2915	633	PMTVD46	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2916	636	PMTVD58	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2917	635	PMTVD64	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2918	634	PMTVD65	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2919	636	PMTVD74	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2920	631	PPHTD16	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2921	631	PPHTD25	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2922	632	PVLDCK69	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2923	632	PVLDCK70	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2924	632	PVLDCK74	INGRESO	11.00	11.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2925	845	250910	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2926	700	2510227462	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2927	592	EFG94	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2928	586	EFG99	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2929	587	EFH05	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2930	588	EFH06	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2931	590	EFH06	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2932	589	EFH07	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2933	595	EFH10	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2934	585	EFH14	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2935	591	EFH17	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2936	710	EFH18	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2937	593	EFH23	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2938	612	EFH26	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2939	596	EFH39	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2940	603	EFH40	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2941	615	EFH41	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2942	597	EFH43	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2943	598	EFH43	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2944	709	EFH44	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2945	601	EFH44	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2946	604	EFH44	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2947	594	EFH45	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2948	609	EFH45	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2949	610	EFH45	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2950	606	EFH47	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2951	616	EFH48	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2952	602	EFH50	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2953	712	EFH51	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2954	617	EFH56	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2955	711	EFH56	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2956	599	EFH59	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2957	600	EFH59	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2958	605	EFH60	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2959	613	EFH62	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2960	608	EFH63	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2961	611	EFH63	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2962	614	EFH64	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2963	840	2405-0167	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2964	846	SL241428	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2965	840	2405-0167	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2966	846	SL241428	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2967	703	2510227459	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2968	700	2510227462	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2969	659	S25TZALJAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2970	681	S25TZAQOAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2971	660	S25TZARNAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2972	684	S25TZATHAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2018	768	G291	INGRESO	6.00	6.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2019	781	G291	INGRESO	1.00	1.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2020	769	G185	INGRESO	15.00	15.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2021	782	G122	INGRESO	3.00	3.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2022	770	G222	INGRESO	6.00	6.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2023	771	D231	INGRESO	12.00	12.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2024	772	H129	INGRESO	7.00	7.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2025	773	H131	INGRESO	12.00	12.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2026	783	H122	INGRESO	6.00	6.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2027	784	G238	INGRESO	3.00	3.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2028	785	AAB	INGRESO	3.00	3.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2029	786	G185	INGRESO	3.00	3.00	NOTA_INGRESO	00000030	31	\N	2026-06-10 21:17:07.180123
2064	796	0000072163	SALIDA	1.00	0.00	NOTA_SALIDA	00000040	43	\N	2026-06-11 21:46:11.547325
2112	590	EFG78	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2113	592	EFG82	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2114	588	EFG94	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2115	593	EFG95	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2116	586	EFG99	INGRESO	11.00	11.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2117	588	EFG99	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2118	587	EFH05	INGRESO	11.00	11.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2119	589	EFH07	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2120	591	EFH07	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2121	595	EFH07	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2122	598	EFH09	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2123	594	EFH10	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2124	597	EFH10	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2125	596	EFH13	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2126	606	EFH13	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2127	585	EFH14	INGRESO	11.00	11.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2128	612	EFH17	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2129	604	EFH18	INGRESO	9.00	9.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2130	605	EFH19	INGRESO	9.00	9.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2131	597	EFH20	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2132	616	EFH23	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2133	617	EFH23	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2134	601	EFH24	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2135	602	EFH24	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2136	610	EFH25	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2137	611	EFH26	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2138	615	EFH29	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2139	600	EFH30	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2140	614	EFH31	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2141	599	EFH32	INGRESO	16.00	16.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2142	607	EFH32	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2143	603	EFH33	INGRESO	9.00	9.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2144	613	EFH33	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2145	609	EFH34	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2146	608	EFH35	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2147	623	MVC08	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2148	622	MVC10	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2149	620	MVC11	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2150	624	MVC11	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2151	618	MVC12	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2152	619	MVC13	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2153	621	MVC14	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2154	629	PMTDF53	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2155	628	PMTDF57	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2156	630	PMTDF59	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2157	625	PMTDF63	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2158	626	PMTDF64	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2159	627	PMTDF64	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2160	635	PMTVD11	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2161	633	PMTVD14	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2162	634	PMTVD20	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2163	636	PMTVD22	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2164	631	PPHTC61	INGRESO	14.00	14.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2165	632	PVLDCK13	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2166	632	PVLDCK14	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2167	638	POBC02	INGRESO	15.00	15.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2168	637	POBC13	INGRESO	35.00	35.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2169	661	P25TZAECAG	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2170	662	P25TZAFLAA	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2171	640	S25TZAHPAH	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2172	640	S25TZAHUAC	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2173	646	S25TZAHXAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2030	787	407688	INGRESO	1.00	1.00	NOTA_INGRESO	00000031	32	\N	2026-06-10 21:35:21.625374
2031	788	304190	INGRESO	1.00	1.00	NOTA_INGRESO	00000031	32	\N	2026-06-10 21:35:21.625374
2065	792	784828	SALIDA	1.00	0.00	NOTA_SALIDA	00000041	44	\N	2026-06-11 21:50:20.265373
2066	798	MO14060356	SALIDA	1.00	0.00	NOTA_SALIDA	00000041	44	\N	2026-06-11 21:50:20.265373
2174	682	S25TZAJPAB	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2175	663	S25TZAKJAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2176	668	S25TZAKNAB	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2177	642	S25TZALOAJ	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2178	667	S25TZALZAA	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2179	653	S25TZAMAAB	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2180	681	S25TZAMBAE	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2181	681	S25TZAMDAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2182	718	S25TZAMMAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2183	652	S25TZAMNAB	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2184	680	S25TZANFAD	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2185	645	S25TZANUAG	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2186	648	S25TZANZAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2187	639	S25TZAOJAA	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2188	641	S25TZAONAF	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2189	647	S25TZAPKAA	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2190	643	S25TZAQWAF	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2191	680	S25TZASCAC	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2192	684	S25TZASMAC	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2193	660	S25TZATHAD	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2194	717	202510601	INGRESO	1000.00	1000.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2195	686	5032071	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2196	705	H3201753	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2199	687	I3232620	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2202	690	2309-0228	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2203	691	2309-0229	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2204	689	2309-0232	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2205	686	5080571	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2206	692	20231007	INGRESO	20.00	20.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2207	733	H3283983	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2208	694	H3318717	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2209	700	2508073037	INGRESO	20.00	20.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2210	692	20231007	INGRESO	21.00	21.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2211	692	20231007	INGRESO	12.00	12.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2212	704	I3192257	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2213	656	P25TZAEZAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2214	685	P25TZAFIAA	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2215	662	P25TZAFLAA	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2216	648	P25TZAFWAA	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2217	669	P25TZAFXAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2218	655	P25TZAGBAB	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2219	661	P25TZAGDAB	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2220	645	P25TZAGGAD	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2221	670	P25TZAGRAF	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2222	643	P25TZAGYAD	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2223	680	P25TZAHLAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2224	682	S25TZAJPAB	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2225	683	S25TZAJYAD	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2226	682	S25TZAKHAC	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2227	659	S25TZALJAC	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2228	685	S25TZALPAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2229	666	S25TZALWAB	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2230	644	S25TZAMAAB	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2231	646	S25TZAMXAD	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2232	649	S25TZAMZAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2233	665	S25TZANGAA	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2234	668	S25TZANGAA	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2235	683	S25TZANIAA	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2236	650	S25TZANRAA	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2237	657	S25TZAOAAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2238	672	S25TZAOCAC	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2239	671	S25TZAOIAB	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2240	676	S25TZAOLAB	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2241	658	S25TZAOOAA	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2242	653	S25TZAOZAB	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2243	651	S25TZAPAAC	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2244	678	S25TZAPGAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2067	777	H25B00450463	SALIDA	1.00	0.00	NOTA_SALIDA	00000042	45	\N	2026-06-11 21:56:23.070129
2068	778	360101-M25C09810051	SALIDA	1.00	0.00	NOTA_SALIDA	00000042	45	\N	2026-06-11 21:56:23.070129
2245	679	S25TZAPGAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2246	681	S25TZAPJAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2247	647	S25TZAPKAA	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2248	652	S25TZAPKAA	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2249	667	S25TZAPPAB	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2250	664	S25TZAPTAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2251	654	S25TZAPYAA	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
1970	575	2025111701	INGRESO	2.00	2.00	NOTA_INGRESO	00000013	13	\N	2026-06-01 21:09:26.680791
1971	576	2025090101	INGRESO	4.00	4.00	NOTA_INGRESO	00000013	13	\N	2026-06-01 21:09:26.680791
1972	577	2025112201	INGRESO	4.00	4.00	NOTA_INGRESO	00000013	13	\N	2026-06-01 21:09:26.680791
1973	575	2025111701	SALIDA	2.00	0.00	NOTA_SALIDA	00000031	34	\N	2026-06-01 21:18:23.88643
1974	576	2025090101	SALIDA	4.00	0.00	NOTA_SALIDA	00000031	34	\N	2026-06-01 21:18:23.88643
1975	577	2025112201	SALIDA	4.00	0.00	NOTA_SALIDA	00000031	34	\N	2026-06-01 21:18:23.88643
1976	578	2025111701	INGRESO	2.00	2.00	NOTA_INGRESO	00000014	14	\N	2026-06-01 21:27:30.584682
1977	578	2025111701	SALIDA	2.00	0.00	NOTA_SALIDA	00000032	35	\N	2026-06-01 21:58:22.640255
1978	579	2024101702	INGRESO	5.00	5.00	NOTA_INGRESO	00000015	15	\N	2026-06-01 22:01:27.037312
1979	579	2024101702	SALIDA	5.00	0.00	NOTA_SALIDA	00000033	36	\N	2026-06-01 22:02:58.227354
1980	580	20251212	INGRESO	25.00	25.00	NOTA_INGRESO	00000016	16	\N	2026-06-02 15:21:20.165941
2252	681	S25TZAQOAB	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
1982	582	2025121802	INGRESO	1.00	1.00	NOTA_INGRESO	00000017	18	\N	2026-06-02 15:40:53.240312
1983	42	K3371732	INGRESO	10.00	10.00	NOTA_INGRESO	00000018	19	\N	2026-06-02 17:33:01.643082
1984	43	K3396584	INGRESO	20.00	20.00	NOTA_INGRESO	00000018	19	\N	2026-06-02 17:33:01.643082
1985	583	4100272	INGRESO	5.00	5.00	NOTA_INGRESO	00000019	20	\N	2026-06-02 21:45:11.652616
1986	584	I3455577	INGRESO	8.00	8.00	NOTA_INGRESO	00000019	20	\N	2026-06-02 21:45:11.652616
2253	681	S25TZAQSAA	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2254	675	S25TZARIAE	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2255	673	S25TZARJAC	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2256	660	S25TZARNAC	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2257	674	S25TZARPAC	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2258	680	S25TZARQAE	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2259	663	S25TZARYAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2260	642	S25TZASCAL	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2261	640	S25TZASDAB	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2262	641	S25TZASDAJ	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2263	684	S25TZASMAC	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2264	684	S25TZATHAD	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2265	677	S25TZAUAAG	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2266	639	S25TZAUFAG	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2267	705	H3201753	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2268	586	EFG99	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2269	587	EFH05	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2270	585	EFH14	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2271	622	MVC14	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2272	619	MVC16	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2273	620	MVC17	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2274	696	MVC18	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2275	695	MVC19	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2276	618	MVC19	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2277	621	MVC19	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2278	697	PMTDF50	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2279	628	PMTDF57	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2280	629	PMTDF61	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2281	699	PMTDF62	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2282	625	PMTDF65	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2283	698	PMTDF66	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2284	626	PMTDF67	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2285	627	PMTDF68	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2286	633	PMTVD19	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2287	635	PMTVD21	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2288	634	PMTVD24	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2289	636	PMTVD25	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2290	634	PMTVD27	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2291	631	PPHTC72	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2292	632	PVLDCK19	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2293	632	PVLDCK20	INGRESO	17.00	17.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2294	706	E4747855	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2295	708	250411A101	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2296	586	EFG99	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2297	587	EFH05	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2298	585	EFH14	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2979	753	2510227457	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2980	754	2510227461	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2981	802	2510227467	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2982	804	2510227469	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2983	805	2510227470	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2984	806	2510227471	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2985	809	2510227474	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2986	812	2510227477	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2987	813	2510227478	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2988	817	2510227482	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2989	818	2510227483	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2990	821	2510227486	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2991	822	2510227487	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2992	823	2510227488	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2993	824	2510227489	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2994	825	2510227490	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2995	826	2510227491	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2996	828	2510227493	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2997	829	2510227494	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2998	830	2510227495	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2999	831	2510227496	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3000	617	EFG22	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3001	592	EFG94	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3002	587	EFH05	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3003	588	EFH06	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3004	589	EFH07	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3005	595	EFH10	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3006	585	EFH14	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3007	710	EFH18	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3008	593	EFH23	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3009	603	EFH40	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3010	615	EFH41	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3011	597	EFH43	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3012	598	EFH43	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3013	709	EFH44	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3014	601	EFH44	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3015	604	EFH44	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3016	594	EFH45	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3017	609	EFH45	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3018	610	EFH45	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3019	606	EFH47	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3020	616	EFH48	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3021	712	EFH51	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3022	617	EFH56	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3023	599	EFH59	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3024	600	EFH59	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3025	605	EFH60	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3026	613	EFH62	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3027	608	EFH63	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3028	611	EFH63	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3029	614	EFH64	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3030	590	EHF06	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3031	648	P25TZAFWAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3032	655	P25TZAGBAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3033	661	P25TZAGDAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3034	645	P25TZAGGAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3035	676	S25TZAOLAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3036	678	S25TZAPGAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3037	679	S25TZAPGAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3038	673	S25TZARJAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3039	640	S25TZASDAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3040	684	S25TZASMAC	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3041	684	S25TZATHAD	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3042	677	S25TZAUAAG	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3050	847	FD254945	INGRESO	120.00	120.00	NOTA_INGRESO	00000038	40	\N	2026-06-18 15:47:25.787293
3051	848	RA4539	INGRESO	100.00	100.00	NOTA_INGRESO	00000039	41	\N	2026-06-18 16:20:01.718087
3052	848	RA4539	SALIDA	50.00	50.00	NOTA_SALIDA	00000053	56	\N	2026-06-18 16:25:55.36302
3054	700	2605189335	INGRESO	300.00	300.00	NOTA_INGRESO	00000040	43	\N	2026-06-18 19:28:15.300949
3055	624	MVC19	INGRESO	1.00	1.00	NOTA_INGRESO	00000041	44	\N	2026-06-18 20:06:31.062919
3056	630	PMTDF59	INGRESO	1.00	1.00	NOTA_INGRESO	00000041	44	\N	2026-06-18 20:06:31.062919
3057	631	PPHTC88	INGRESO	1.00	1.00	NOTA_INGRESO	00000041	44	\N	2026-06-18 20:06:31.062919
3058	632	PVLDCK38	INGRESO	1.00	1.00	NOTA_INGRESO	00000041	44	\N	2026-06-18 20:06:31.062919
3059	636	PMTDF29	INGRESO	1.00	1.00	NOTA_INGRESO	00000041	44	\N	2026-06-18 20:06:31.062919
3064	632	PVLDCK13	INGRESO	1.00	1.00	NOTA_INGRESO	00000043	46	\N	2026-06-18 20:36:26.752392
3065	681	S25TZAQOAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000044	47	\N	2026-06-18 20:47:47.484128
3066	683	S25TZANIAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000044	47	\N	2026-06-18 20:47:47.484128
3067	659	S25TZALJAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000044	47	\N	2026-06-18 20:47:47.484128
3068	683	S25TZANIAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000044	47	\N	2026-06-18 20:47:47.484128
3069	681	S25TZAQSAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000044	47	\N	2026-06-18 20:47:47.484128
3070	717	202512604	INGRESO	1.00	1.00	NOTA_INGRESO	00000044	47	\N	2026-06-18 20:47:47.484128
3071	845	250910	INGRESO	10.00	10.00	NOTA_INGRESO	00000045	48	\N	2026-06-18 21:17:00.009799
3072	713	202511609	INGRESO	195.00	195.00	NOTA_INGRESO	00000046	49	\N	2026-06-18 21:26:14.618097
3073	653	S25TZAOZAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000047	50	\N	2026-06-18 21:36:37.42468
3074	659	S25TZALJAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000047	50	\N	2026-06-18 21:36:37.42468
3075	661	P25TZAGDAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000047	50	\N	2026-06-18 21:36:37.42468
3076	671	S25TZAOIAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000047	50	\N	2026-06-18 21:36:37.42468
3077	617	EFH56	INGRESO	1.00	1.00	NOTA_INGRESO	00000047	50	\N	2026-06-18 21:36:37.42468
3078	746	251224A291	INGRESO	10.00	10.00	NOTA_INGRESO	00000048	51	\N	2026-06-18 21:45:17.982226
3079	842	260327A121	INGRESO	10.00	10.00	NOTA_INGRESO	00000048	51	\N	2026-06-18 21:45:17.982226
3080	606	EFH47	INGRESO	1.00	1.00	NOTA_INGRESO	00000049	52	\N	2026-06-18 21:57:12.389588
3081	684	S25TZASMAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000049	52	\N	2026-06-18 21:57:12.389588
3049	880	SP5325022829	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3060	875	4100272	INGRESO	5.00	5.00	NOTA_INGRESO	00000042	45	\N	2026-06-18 20:21:20.075229
3061	882	I3455577	INGRESO	8.00	8.00	NOTA_INGRESO	00000042	45	\N	2026-06-18 20:21:20.075229
3062	892	K3371732	INGRESO	10.00	10.00	NOTA_INGRESO	00000042	45	\N	2026-06-18 20:21:20.075229
3063	883	K3396584	INGRESO	20.00	20.00	NOTA_INGRESO	00000042	45	\N	2026-06-18 20:21:20.075229
381	873	2025255	INGRESO	3.00	3.00	NOTA_INGRESO	00000003	3	\N	2026-05-22 15:04:48.568127
382	874	2601061	INGRESO	5000.00	5000.00	NOTA_INGRESO	00000003	3	\N	2026-05-22 15:04:48.568127
383	874	2601062	INGRESO	7000.00	7000.00	NOTA_INGRESO	00000003	3	\N	2026-05-22 15:04:48.568127
384	873	2025255	INGRESO	3.00	3.00	NOTA_INGRESO	00000003	3	\N	2026-05-22 15:04:48.568127
385	873	2025255	INGRESO	1.00	1.00	NOTA_INGRESO	00000003	3	\N	2026-05-22 15:04:48.568127
2329	881	I3162108	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2330	883	K3242383	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2338	877	2504259336	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2339	876	2506106166	INGRESO	25.00	25.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2355	881	I3162108	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2356	882	I3197593	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2357	882	I3197593	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2358	882	I3248498	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2359	883	K3242383	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2370	881	I3162108	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2372	882	I3197593	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2374	882	I3248498	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2460	877	2504259336	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2461	876	2506106166	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2536	877	2504259336	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2537	876	2506106166	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2564	884	SP1124052316	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2565	885	SP4125022813	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2566	886	SP4125080402	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2567	887	SP5024091403	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2568	888	SP5025090304	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2569	880	SP5325022829	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2589	884	SP1124052316	INGRESO	14.00	14.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2590	878	SP1125081407	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2591	889	SP4125022805	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2592	890	SP4125031203	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2593	888	SP5025090304	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2594	880	SP5325022829	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2704	880	SP5325041706	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2729	880	SP5325041706	INGRESO	15.00	15.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2793	881	I3304184	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2794	891	I3356223	INGRESO	7.00	7.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2795	891	I3356227	INGRESO	4.00	4.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2796	881	I3370429	INGRESO	21.00	21.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2797	883	K3371675	INGRESO	80.00	80.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2798	892	K3371732	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2799	876	2506106166	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2800	877	2511114218	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2802	878	SP1125081407	INGRESO	9.00	9.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2803	879	SP5324121808	INGRESO	9.00	9.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2804	880	SP5325041706	INGRESO	15.00	15.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2810	893	H2735360	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2811	894	H3247331	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2812	891	I3304488	INGRESO	6.00	6.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2858	895	6021241	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2859	876	2506106166	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2860	877	2511114218	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2861	882	I3356253	INGRESO	15.00	15.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2862	896	I3385327	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2863	883	K3377984	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2867	879	SP5324121808	INGRESO	3.00	3.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2868	880	SP5325041706	INGRESO	8.00	8.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2973	876	2506106166	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2974	877	2511114218	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2197	881	I3162108	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2198	882	I3197593	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2200	882	I3248498	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2201	883	K3242383	INGRESO	10.00	10.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2975	878	SP1125121506	INGRESO	20.00	20.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2976	879	SP5324121808	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2977	880	SP5325022829	INGRESO	1.00	1.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
2978	880	SP5325082210	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3043	884	SP1124052316	INGRESO	5.00	5.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3044	885	SP4125022813	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3045	890	SP4125031203	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3046	886	SP4125080402	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3047	887	SP5024091403	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
3048	888	SP5025090304	INGRESO	2.00	2.00	NOTA_INGRESO	00000037	39	\N	2026-06-17 21:48:43.619236
386	873	2025255	SALIDA	3.00	4.00	NOTA_SALIDA	00000004	7	\N	2026-05-22 15:12:52.558649
387	874	2601061	SALIDA	2.00	4998.00	NOTA_SALIDA	00000004	7	\N	2026-05-22 15:12:52.558649
388	874	2601062	SALIDA	2.00	6998.00	NOTA_SALIDA	00000004	7	\N	2026-05-22 15:12:52.558649
389	873	2025255	SALIDA	2.00	2.00	NOTA_SALIDA	00000004	7	\N	2026-05-22 15:12:52.558649
390	873	2025255	SALIDA	2.00	0.00	NOTA_SALIDA	00000004	7	\N	2026-05-22 15:12:52.558649
391	874	2601061	SALIDA	2.00	4996.00	NOTA_SALIDA	00000004	7	\N	2026-05-22 15:12:52.558649
392	874	2601062	SALIDA	2.00	6996.00	NOTA_SALIDA	00000004	7	\N	2026-05-22 15:12:52.558649
3082	585	EFH14	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3083	586	EFG99	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3084	587	EFH05	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3085	642	S25TZASCAL	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3086	589	EFH07	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3087	645	P25TZAGGAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3088	593	EFH23	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3089	648	P25TZAFWAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3090	650	S25TZANRAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3091	651	S25TZAPAAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3092	652	S25TZAPKAA	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3093	653	S25TZAOZAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3094	602	EFH50	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3095	683	S25TZAJYAD	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3096	604	EFH44	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3097	608	EFH63	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3098	611	EFH63	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3099	613	EFH62	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3100	614	EFH64	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3101	615	EFH42	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3102	672	S25TZAOCAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000050	53	\N	2026-06-19 16:24:27.760596
3103	661	P25TZAGDAB	INGRESO	1.00	1.00	NOTA_INGRESO	00000051	54	\N	2026-06-19 17:20:28.69059
3104	673	S25TZARJAC	INGRESO	1.00	1.00	NOTA_INGRESO	00000051	54	\N	2026-06-19 17:20:28.69059
3105	614	EFH64	INGRESO	1.00	1.00	NOTA_INGRESO	00000051	54	\N	2026-06-19 17:20:28.69059
3106	615	EFH41	INGRESO	1.00	1.00	NOTA_INGRESO	00000051	54	\N	2026-06-19 17:20:28.69059
3107	840	2405-0167	INGRESO	6.00	6.00	NOTA_INGRESO	00000052	55	\N	2026-06-19 17:38:36.828358
3108	700	2605189335	INGRESO	300.00	300.00	NOTA_INGRESO	00000053	56	\N	2026-06-19 17:51:36.270972
3109	717	202604636	INGRESO	500.00	500.00	NOTA_INGRESO	00000053	56	\N	2026-06-19 17:51:36.270972
3110	713	202604635	INGRESO	200.00	200.00	NOTA_INGRESO	00000053	56	\N	2026-06-19 17:51:36.270972
3111	877	2504259336	INGRESO	5.00	5.00	NOTA_INGRESO	00000054	57	\N	2026-06-19 18:02:49.020161
3112	876	2506106166	INGRESO	5.00	5.00	NOTA_INGRESO	00000054	57	\N	2026-06-19 18:02:49.020161
\.


--
-- Data for Name: lotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lotes (id, producto_id, numero_lote, fecha_vencimiento, cantidad_ingresada, cantidad_disponible, nota_ingreso_id, created_at, updated_at, cantidad_inicial, cantidad_actual, estado) FROM stdin;
842	574	F22B123C2	2029-12-03	2.00	0.00	12	2026-06-01 20:56:22.3506	2026-06-01 20:59:06.41841	\N	\N	ACTIVO
137	109	20260225J1	2028-02-24	500.00	2.00	5	2026-05-22 19:39:58.723865	2026-05-22 19:51:40.686306	\N	\N	ACTIVO
140	327	2103144	2027-10-31	1000.00	0.00	8	2026-05-22 21:19:09.526797	2026-05-22 21:21:54.065481	\N	\N	ACTIVO
9	4	SP5325022823	2028-03-02	23.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-28 17:02:29.627232	\N	\N	ACTIVO
230	199	SM0612-062010	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
5	5	SP5324091912	2027-09-19	15.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-28 17:04:47.523325	\N	\N	ACTIVO
12	9	SP1124092024	2027-10-07	10.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-28 17:04:47.523325	\N	\N	ACTIVO
7	6	SP1124041531	2027-06-30	40.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-28 17:02:29.627232	\N	\N	ACTIVO
6	6	SP1124041023	2027-04-14	5.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-28 17:04:47.523325	\N	\N	ACTIVO
3	3	FST25062001	2028-06-20	1200.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
1	1	99532	2028-04-01	10400.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
2	2	99530	2028-04-01	4000.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
14	11	33998	2028-06-27	60.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
908	801	251210	2027-11-01	4.00	4.00	38	2026-06-11 20:13:30.581808	2026-06-11 20:13:30.581808	\N	\N	ACTIVO
15	12	34047	2028-06-13	120.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
16	13	32965	2028-04-11	90.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
17	14	34985	2028-09-30	120.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
18	15	34415	2028-07-10	120.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
862	764	13500000002507024827	\N	1.00	0.00	21	2026-06-10 15:28:56.24014	2026-06-11 21:13:56.04266	\N	\N	ACTIVO
861	763	13500000002507024826	\N	1.00	0.00	21	2026-06-10 15:28:56.24014	2026-06-11 21:13:56.04266	\N	\N	ACTIVO
860	762	13500000002507024825	\N	1.00	0.00	21	2026-06-10 15:28:56.24014	2026-06-11 21:13:56.04266	\N	\N	ACTIVO
47	40	202510	3000-01-02	120.00	120.00	1	2026-05-21 06:48:17.996923	2026-05-21 06:48:17.996923	\N	\N	ACTIVO
45	38	202510	3000-01-02	468.00	468.00	1	2026-05-21 06:48:17.996923	2026-05-21 06:48:17.996923	\N	\N	ACTIVO
46	39	202510	3000-01-02	360.00	360.00	1	2026-05-21 06:48:17.996923	2026-05-21 06:48:17.996923	\N	\N	ACTIVO
859	761	13500000002507024824	\N	1.00	0.00	21	2026-06-10 15:28:56.24014	2026-06-11 21:13:56.04266	\N	\N	ACTIVO
858	760	13500000002507024823	\N	1.00	0.00	21	2026-06-10 15:28:56.24014	2026-06-11 21:13:56.04266	\N	\N	ACTIVO
857	759	13500000002507024822	\N	1.00	0.00	21	2026-06-10 15:28:56.24014	2026-06-11 21:13:56.04266	\N	\N	ACTIVO
856	758	13500000002507024821	\N	1.00	0.00	21	2026-06-10 15:28:56.24014	2026-06-11 21:13:56.04266	\N	\N	ACTIVO
855	757	13500000002507024820	\N	1.00	0.00	21	2026-06-10 15:28:56.24014	2026-06-11 21:13:56.04266	\N	\N	ACTIVO
881	780	1045824328	2027-08-31	96.00	0.00	30	2026-06-10 21:05:23.498032	2026-06-11 21:31:35.905996	\N	\N	ACTIVO
77	60	241189400	\N	72.00	0.00	2	2026-05-21 18:15:35.017837	2026-06-12 21:26:49.535622	\N	\N	ACTIVO
1355	847	FD254945	2028-07-31	120.00	120.00	40	2026-06-18 15:47:25.787293	2026-06-18 15:47:25.787293	\N	\N	ACTIVO
1406	661	P25TZAGDAB	2027-06-30	1.00	1.00	54	2026-06-19 17:20:28.69059	2026-06-19 17:20:28.69059	\N	\N	ACTIVO
27	24	35201	2027-10-16	90.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
19	16	34413	2027-07-08	200.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
20	17	35088	2027-10-13	400.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
947	620	MVC11	2027-09-16	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1407	673	S25TZARJAC	2027-07-31	1.00	1.00	54	2026-06-19 17:20:28.69059	2026-06-19 17:20:28.69059	\N	\N	ACTIVO
949	618	MVC12	2027-09-22	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1408	614	EFH64	2028-11-18	1.00	1.00	54	2026-06-19 17:20:28.69059	2026-06-19 17:20:28.69059	\N	\N	ACTIVO
951	621	MVC14	2027-09-27	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
952	629	PMTDF53	2027-07-11	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
58	44	I3304488	2028-08-18	6.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
59	47	H2735360	2026-08-04	1.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
60	48	H3247331	2028-02-28	1.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
48	4	SP5325041706	2028-04-15	48.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
56	45	2511114218	2028-11-10	20.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
57	46	2506106166	2028-06-09	20.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
55	5	SP5324121808	2027-12-18	12.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
61	49	I3385327	2028-09-30	3.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
62	43	K3377984	2028-11-01	8.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
63	50	I3356253	2028-10-20	15.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
64	51	6021241	2027-12-31	1.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
1409	615	EFH41	2028-09-27	1.00	1.00	54	2026-06-19 17:20:28.69059	2026-06-19 17:20:28.69059	\N	\N	ACTIVO
102	61	2510115601	2029-11-05	642.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:43:34.983856	\N	\N	ACTIVO
955	625	PMTDF63	2027-08-25	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
956	626	PMTDF64	2027-09-07	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
957	627	PMTDF64	2027-09-07	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
958	635	PMTVD11	2028-06-30	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
960	634	PMTVD20	2028-07-20	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
961	636	PMTVD22	2028-07-29	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
72	55	2509095101	2029-09-26	90.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
106	81	2505004800	\N	2988.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:43:34.983856	\N	\N	ACTIVO
69	55	2510010701	2029-10-07	2154.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
70	55	2510003001	2029-10-07	1356.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
79	59	2512012101	2029-12-10	1344.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:43:34.983856	\N	\N	ACTIVO
965	638	POBC02	2026-06-16	15.00	15.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
966	637	POBC13	2026-07-18	35.00	35.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
967	661	P25TZAECAG	2027-04-30	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
969	640	S25TZAHPAH	2027-03-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
970	640	S25TZAHUAC	2027-04-30	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
971	646	S25TZAHXAC	2027-03-31	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
973	663	S25TZAKJAA	2027-04-30	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
21	18	34374	2027-07-04	160.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
22	19	34525	2027-07-18	150.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
23	20	35133	2027-10-14	90.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
24	21	32781	2028-04-01	87.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
25	22	34689	2027-08-12	100.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
26	23	34919	2027-09-09	100.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
30	8	SP4125022813	2028-03-02	2.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
8	6	SP1124052316	2027-06-18	34.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-28 17:02:29.627232	\N	\N	ACTIVO
31	25	SP5024091403	2027-09-23	2.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
28	4	SP5325022829	2028-03-02	15.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
141	110	SM0612-062301	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
44	37	SP4125022805	2028-03-02	6.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
29	7	SP4125031203	2028-03-19	8.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
32	26	SP5025090304	2028-09-03	4.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
39	33	VM03	2029-05-31	36.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
40	34	SM04	2029-07-31	90.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
41	35	VM03	2029-05-31	24.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
42	36	VM03/38	2029-05-31	90.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
33	27	VM03	2029-05-31	48.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
34	28	SM04	2029-07-31	48.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
35	29	VM03	2029-05-31	48.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
109	84	2506049601	2029-06-13	396.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:43:34.983856	\N	\N	ACTIVO
89	70	25101143	2028-10-01	660.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
36	30	VM03/38	2029-05-31	36.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
37	31	PL02/17	2028-10-31	36.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
38	32	TM04/64	2029-06-30	24.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
66	53	2511047801	2029-11-25	432.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
49	41	I3370429	2028-10-10	21.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
50	42	K3371732	2028-10-24	5.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
82	63	2509098301	2029-10-02	162.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
83	64	2510071701	2029-10-22	162.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
84	65	2509047201	2029-09-17	162.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
85	66	2510098701	2029-10-24	162.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
91	72	2507002501	2029-07-02	78.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
51	43	K3371675	2028-10-24	80.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
86	67	2509092101	2029-09-26	78.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
73	57	2509030901	2029-09-08	12.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
74	57	2510041201	\N	78.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
107	82	2511086701	2029-11-27	1860.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
100	59	2511090601	2029-11-21	1296.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
138	325	SN-560435M25308290001	\N	1.00	0.00	6	2026-05-22 20:37:59.194105	2026-05-22 20:43:43.348421	\N	\N	ACTIVO
52	44	I3356227	2028-11-11	4.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
75	58	2511014801	\N	594.00	0.00	2	2026-05-21 18:15:35.017837	2026-06-12 21:38:00.451488	\N	\N	ACTIVO
111	86	2510075501	\N	189.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
112	87	2511023301	\N	126.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
110	85	2510075401	2029-10-20	126.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
104	80	2505032900	\N	72.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
53	41	I3304184	2028-08-31	4.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
54	44	I3356223	2028-10-27	7.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
43	9	SP1125081407	2028-08-19	14.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-21 17:49:31.918911	\N	\N	ACTIVO
103	79	2411062100	\N	72.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
1356	848	RA4539	2027-10-31	100.00	50.00	41	2026-06-18 16:20:01.718087	2026-06-18 16:25:55.36302	\N	\N	ACTIVO
95	75	2510049801	2029-10-15	30.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
96	75	2510075001	2029-10-21	318.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
81	62	2308074801	2028-03-14	32.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
90	71	2402052101	2028-02-20	144.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
1410	840	2405-0167	2027-04-30	6.00	6.00	55	2026-06-19 17:38:36.828358	2026-06-19 17:38:36.828358	\N	\N	ACTIVO
78	61	2512003601	2029-12-09	2268.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
67	53	2510043501	2029-10-15	108.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
68	54	2510042301	2029-10-14	648.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
93	73	2507028801	2029-07-10	69.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
113	76	2504068001	2029-05-08	224.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:43:34.983856	\N	\N	ACTIVO
101	61	2510042801	2029-10-13	636.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:43:34.983856	\N	\N	ACTIVO
105	81	2506030700	\N	1944.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:43:34.983856	\N	\N	ACTIVO
76	59	2511015301	2029-11-07	1248.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:43:34.983856	\N	\N	ACTIVO
114	88	2511053301	2029-11-17	960.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:43:34.983856	\N	\N	ACTIVO
108	83	2503052801	2029-03-27	114.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:43:34.983856	\N	\N	ACTIVO
843	575	2025111701	2027-11-16	2.00	0.00	13	2026-06-01 21:09:26.680791	2026-06-01 21:18:23.88643	\N	\N	ACTIVO
844	576	2025090101	2027-08-31	4.00	0.00	13	2026-06-01 21:09:26.680791	2026-06-01 21:18:23.88643	\N	\N	ACTIVO
845	577	2025112201	2027-11-21	4.00	0.00	13	2026-06-01 21:09:26.680791	2026-06-01 21:18:23.88643	\N	\N	ACTIVO
65	52	2511090101	2029-11-24	1404.00	0.00	2	2026-05-21 18:15:35.017837	2026-06-12 21:26:49.535622	\N	\N	ACTIVO
71	56	2510067901	2029-10-17	1845.00	0.00	2	2026-05-21 18:15:35.017837	2026-06-12 21:26:49.535622	\N	\N	ACTIVO
883	781	G291	\N	1.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-12 20:03:33.58986	\N	\N	ACTIVO
884	769	G185	\N	15.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-12 20:03:33.58986	\N	\N	ACTIVO
885	782	G122	\N	3.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-12 20:03:33.58986	\N	\N	ACTIVO
98	77	2511022701	2029-11-12	660.00	0.00	2	2026-05-21 18:15:35.017837	2026-06-12 21:26:49.535622	\N	\N	ACTIVO
97	76	2506268201	2029-07-03	384.00	0.00	2	2026-05-21 18:15:35.017837	2026-06-12 21:26:49.535622	\N	\N	ACTIVO
80	62	2403049101	2028-03-14	64.00	0.00	2	2026-05-21 18:15:35.017837	2026-06-12 21:26:49.535622	\N	\N	ACTIVO
92	73	2511048601	2029-11-17	87.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
87	68	2509111101	2029-10-01	156.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
88	69	2509109401	2029-09-29	78.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
94	74	2507076601	2029-08-26	78.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
99	78	25110097	2028-11-17	576.00	0.00	2	2026-05-21 18:15:35.017837	2026-05-21 21:06:17.11392	\N	\N	ACTIVO
139	326	2040355	2028-04-30	500.00	0.00	7	2026-05-22 21:14:37.008465	2026-05-22 21:21:54.065481	\N	\N	ACTIVO
1000	690	2309-0228	2026-08-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
125	98	IN1240527	2027-03-27	70.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:09:57.514601	\N	\N	ACTIVO
127	100	303919	2027-04-19	53.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:09:57.514601	\N	\N	ACTIVO
126	99	IN250523	2027-12-23	70.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:09:57.514601	\N	\N	ACTIVO
123	96	210015	2030-10-31	50.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:14:08.486781	\N	\N	ACTIVO
118	91	20240620	2029-06-19	10.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:14:08.486781	\N	\N	ACTIVO
122	95	20250418	2030-04-17	31.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:14:08.486781	\N	\N	ACTIVO
121	94	212164	2030-02-28	30.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:14:08.486781	\N	\N	ACTIVO
120	93	IN25008662	2030-07-01	30.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:14:08.486781	\N	\N	ACTIVO
119	92	HE0325AM	2030-02-28	10.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:14:08.486781	\N	\N	ACTIVO
124	97	G253	\N	1.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:16:28.605482	\N	\N	ACTIVO
129	102	360124-M24912370023	\N	1.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:23:05.139482	\N	\N	ACTIVO
130	102	360124-M25410060001	\N	1.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:23:05.139482	\N	\N	ACTIVO
846	578	2025111701	2027-11-16	2.00	0.00	14	2026-06-01 21:27:30.584682	2026-06-01 21:58:22.640255	\N	\N	ACTIVO
131	103	361527- M25C10210005	\N	1.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:29:35.012756	\N	\N	ACTIVO
134	106	360080-M25520140001	\N	1.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:31:09.613972	\N	\N	ACTIVO
135	107	2025081551	2027-08-14	2.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:33:26.953266	\N	\N	ACTIVO
136	108	2025081451	2027-08-13	4.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:34:46.675756	\N	\N	ACTIVO
132	104	AAVLK09EX	2027-08-02	3.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:39:25.688242	\N	\N	ACTIVO
133	105	MAVFH04EX	2027-02-10	3.00	0.00	4	2026-05-22 17:04:10.870925	2026-05-22 17:40:24.186056	\N	\N	ACTIVO
863	765	560038-M25910830007	\N	1.00	0.00	22	2026-06-10 16:43:16.751961	2026-06-11 21:13:56.04266	\N	\N	ACTIVO
864	104	AAWAN11EX	2027-09-21	5.00	0.00	23	2026-06-10 16:52:13.68057	2026-06-11 21:16:11.028328	\N	\N	ACTIVO
865	105	MAVLX03EX	2027-08-17	5.00	0.00	23	2026-06-10 16:52:13.68057	2026-06-11 21:16:11.028328	\N	\N	ACTIVO
866	766	DFRVCA11	2026-11-09	1.00	0.00	23	2026-06-10 16:52:13.68057	2026-06-11 21:22:26.778848	\N	\N	ACTIVO
890	783	H122	\N	6.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-11 22:06:13.784224	\N	\N	ACTIVO
891	784	G238	\N	3.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-11 22:06:13.784224	\N	\N	ACTIVO
892	785	AAB	\N	3.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-11 22:06:13.784224	\N	\N	ACTIVO
893	786	G185	\N	3.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-11 22:06:13.784224	\N	\N	ACTIVO
1001	691	2309-0229	2026-08-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
128	101	202507V	2030-07-31	94.00	3.00	4	2026-05-22 17:04:10.870925	2026-06-12 19:53:20.388098	\N	\N	ACTIVO
889	773	H131	\N	12.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-12 20:03:33.58986	\N	\N	ACTIVO
974	668	S25TZAKNAB	2027-04-30	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
976	667	S25TZALZAA	2027-05-31	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
978	681	S25TZAMBAE	2027-05-31	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
979	681	S25TZAMDAA	2027-05-31	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
980	718	S25TZAMMAB	2027-05-31	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
981	652	S25TZAMNAB	2027-05-31	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
983	645	S25TZANUAG	2027-05-31	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
984	648	S25TZANZAD	2027-06-30	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
115	873	2025255	2030-08-01	7.00	0.00	3	2026-05-22 15:04:48.568127	2026-05-22 15:12:52.558649	\N	\N	ACTIVO
116	874	2601061	2031-01-25	5000.00	4996.00	3	2026-05-22 15:04:48.568127	2026-05-22 15:12:52.558649	\N	\N	ACTIVO
117	874	2601062	2031-01-25	7000.00	6996.00	3	2026-05-22 15:04:48.568127	2026-05-22 15:12:52.558649	\N	\N	ACTIVO
1411	700	2605189335	2029-05-17	300.00	300.00	56	2026-06-19 17:51:36.270972	2026-06-19 17:51:36.270972	\N	\N	ACTIVO
1412	717	202604636	2029-04-27	500.00	500.00	56	2026-06-19 17:51:36.270972	2026-06-19 17:51:36.270972	\N	\N	ACTIVO
991	660	S25TZATHAD	2027-07-31	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
992	717	202510601	2028-10-13	1000.00	1000.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1413	713	202604635	2029-04-27	200.00	200.00	56	2026-06-19 17:51:36.270972	2026-06-19 17:51:36.270972	\N	\N	ACTIVO
1007	700	2508073037	2028-08-06	20.00	20.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
847	579	2024101702	2026-10-16	5.00	0.00	15	2026-06-01 22:01:27.037312	2026-06-01 22:02:58.227354	\N	\N	ACTIVO
867	767	F1010W1E00D	2027-10-14	20.00	0.00	24	2026-06-10 17:59:42.257729	2026-06-11 21:31:35.905996	\N	\N	ACTIVO
909	796	0000072163	2028-05-02	1.00	0.00	35	2026-06-11 21:39:11.381521	2026-06-11 21:46:11.547325	\N	\N	ACTIVO
895	788	304190	2027-09-02	1.00	0.00	32	2026-06-10 21:35:21.625374	2026-06-11 21:59:42.18769	\N	\N	ACTIVO
894	787	407688	2027-07-08	1.00	0.00	32	2026-06-10 21:35:21.625374	2026-06-12 19:53:20.388098	\N	\N	ACTIVO
1358	700	2605189335	2029-05-17	300.00	300.00	43	2026-06-18 19:28:15.300949	2026-06-18 19:28:15.300949	\N	\N	ACTIVO
1414	877	2504259336	2028-04-24	5.00	5.00	57	2026-06-19 18:02:49.020161	2026-06-19 18:02:49.020161	\N	\N	ACTIVO
1415	876	2506106166	2028-06-09	5.00	5.00	57	2026-06-19 18:02:49.020161	2026-06-19 18:02:49.020161	\N	\N	ACTIVO
260	229	SM0612-062040	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
261	230	SM0612-062041	\N	25.00	25.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
284	253	SM0612-062064	\N	12.00	12.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
848	580	20251212	2030-11-30	25.00	25.00	16	2026-06-02 15:21:20.165941	2026-06-02 15:21:20.165941	\N	\N	ACTIVO
329	271	SM0612-062407	\N	12.00	12.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
332	274	SM0612-062410	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
334	276	SM0612-062412	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
335	277	SM0612-062413	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
337	279	SM0612-062415	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
339	281	SM0612-062417	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
340	282	SM0612-062418	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
341	283	SM0612-062419	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
342	284	SM0612-062420	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
343	285	SM0612-062421	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
344	286	SM0612-062422	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
345	287	SM0612-062423	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
346	288	SM0612-062424	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
347	289	SM0612-062425	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
1359	624	MVC19	2027-10-15	1.00	1.00	44	2026-06-18 20:06:31.062919	2026-06-18 20:06:31.062919	\N	\N	ACTIVO
349	291	SM0612-062427	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
350	292	SM0612-062428	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
1360	630	PMTDF59	2027-08-06	1.00	1.00	44	2026-06-18 20:06:31.062919	2026-06-18 20:06:31.062919	\N	\N	ACTIVO
352	294	SM0612-062430	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
353	295	SM0612-062431	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
354	296	SM0612-062432	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
355	297	SM0612-062433	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
356	298	SM0612-062434	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
357	299	SM0612-062435	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
358	300	SM0612-062436	\N	6.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	\N	\N	ACTIVO
1361	631	PPHTC88	2027-12-29	1.00	1.00	44	2026-06-18 20:06:31.062919	2026-06-18 20:06:31.062919	\N	\N	ACTIVO
882	768	G291	\N	6.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-12 20:03:33.58986	\N	\N	ACTIVO
886	770	G222	\N	6.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-12 20:03:33.58986	\N	\N	ACTIVO
868	768	G222	\N	1.00	0.00	25	2026-06-10 18:30:57.695335	2026-06-12 20:09:12.707425	\N	\N	ACTIVO
869	769	G185	\N	2.00	0.00	25	2026-06-10 18:30:57.695335	2026-06-12 20:09:12.707425	\N	\N	ACTIVO
870	770	G222	\N	2.00	0.00	25	2026-06-10 18:30:57.695335	2026-06-12 20:09:12.707425	\N	\N	ACTIVO
871	771	D231	\N	2.00	0.00	25	2026-06-10 18:30:57.695335	2026-06-12 20:09:12.707425	\N	\N	ACTIVO
874	774	F229	\N	1.00	0.00	25	2026-06-10 18:30:57.695335	2026-06-12 20:09:12.707425	\N	\N	ACTIVO
875	774	D129	\N	1.00	0.00	25	2026-06-10 18:30:57.695335	2026-06-12 20:09:12.707425	\N	\N	ACTIVO
873	773	H121	\N	2.00	0.00	25	2026-06-10 18:30:57.695335	2026-06-12 20:09:12.707425	\N	\N	ACTIVO
872	772	H129	\N	2.00	0.00	25	2026-06-10 18:30:57.695335	2026-06-12 20:09:12.707425	\N	\N	ACTIVO
1362	632	PVLDCK38	2028-10-08	1.00	1.00	44	2026-06-18 20:06:31.062919	2026-06-18 20:06:31.062919	\N	\N	ACTIVO
1363	636	PMTDF29	2028-09-27	1.00	1.00	44	2026-06-18 20:06:31.062919	2026-06-18 20:06:31.062919	\N	\N	ACTIVO
1061	620	MVC17	2027-10-07	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1062	696	MVC18	2027-10-13	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
383	9	SP1125121506	2028-12-23	20.00	0.00	10	2026-05-27 20:44:48.616357	2026-05-27 21:11:41.72801	\N	\N	ACTIVO
384	5	SP5324121808	2027-12-18	5.00	0.00	10	2026-05-27 20:44:48.616357	2026-05-27 21:11:41.72801	\N	\N	ACTIVO
385	45	2511114218	2028-11-10	10.00	0.00	10	2026-05-27 20:44:48.616357	2026-05-27 21:11:41.72801	\N	\N	ACTIVO
386	46	2506106166	2028-06-09	10.00	0.00	10	2026-05-27 20:44:48.616357	2026-05-27 21:11:41.72801	\N	\N	ACTIVO
387	4	SP5325022829	2028-03-02	1.00	0.00	10	2026-05-27 20:44:48.616357	2026-05-27 21:11:41.72801	\N	\N	ACTIVO
388	4	SP5325082210	2028-08-23	5.00	0.00	10	2026-05-27 20:44:48.616357	2026-05-27 21:11:41.72801	\N	\N	ACTIVO
10	7	SP4125051505	2028-05-18	5.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-28 17:00:08.378481	\N	\N	ACTIVO
11	8	SP4124040324	2027-04-07	2.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-28 17:00:08.378481	\N	\N	ACTIVO
13	10	SP4125080402	2028-08-05	5.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-28 17:00:08.378481	\N	\N	ACTIVO
4	4	SP5324050510	2027-05-06	12.00	0.00	1	2026-05-21 06:48:17.996923	2026-05-28 17:00:08.378481	\N	\N	ACTIVO
1064	618	MVC19	2027-10-15	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1065	621	MVC19	2027-10-15	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
269	238	SM0612-062049	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
1066	697	PMTDF50	2027-07-05	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1068	699	PMTDF62	2027-08-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
282	251	SM0612-062062	\N	6.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
1069	625	PMTDF65	2027-09-15	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
325	267	SM0612-062403	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
1083	633	PMTVC81	2028-02-11	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1074	635	PMTVD21	2028-07-21	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1075	634	PMTVD24	2028-08-02	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1076	636	PMTVD25	2028-08-07	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1077	634	PMTVD27	2028-08-29	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1078	631	PPHTC72	2027-11-04	50.00	50.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1079	632	PVLDCK19	2028-08-21	16.00	16.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1080	632	PVLDCK20	2028-08-23	34.00	34.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
876	775	F0331X3F00D	2028-04-02	20.00	1.00	26	2026-06-10 20:14:49.390947	2026-06-11 21:22:26.778848	\N	\N	ACTIVO
900	793	504/25	2028-07-07	9.00	0.00	34	2026-06-11 15:32:06.363193	2026-06-11 21:33:38.610396	\N	\N	ACTIVO
901	794	566/24	2027-06-27	9.00	0.00	34	2026-06-11 15:32:06.363193	2026-06-11 21:33:38.610396	\N	\N	ACTIVO
899	792	784828	\N	1.00	0.00	34	2026-06-11 15:32:06.363193	2026-06-11 21:50:20.265373	\N	\N	ACTIVO
887	771	D231	\N	12.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-12 20:03:33.58986	\N	\N	ACTIVO
888	772	H129	\N	7.00	0.00	31	2026-06-10 21:17:07.180123	2026-06-12 20:03:33.58986	\N	\N	ACTIVO
1004	692	20231007	2026-09-30	54.00	54.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
256	225	SM0612-062036	\N	6.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
1086	701	2510227448	2028-10-22	400.00	400.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1364	875	4100272	2026-09-30	5.00	5.00	45	2026-06-18 20:21:20.075229	2026-06-18 20:21:20.075229	\N	\N	ACTIVO
1365	882	I3455577	2029-02-26	8.00	8.00	45	2026-06-18 20:21:20.075229	2026-06-18 20:21:20.075229	\N	\N	ACTIVO
287	256	SM0612-062101	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
1366	892	K3371732	2028-10-24	10.00	10.00	45	2026-06-18 20:21:20.075229	2026-06-18 20:21:20.075229	\N	\N	ACTIVO
1367	883	K3396584	2028-11-22	20.00	20.00	45	2026-06-18 20:21:20.075229	2026-06-18 20:21:20.075229	\N	\N	ACTIVO
999	883	K3242383	2028-05-31	20.00	20.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
995	881	I3162108	2028-03-03	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1098	722	25A574	2028-09-14	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
996	882	I3197593	2028-04-22	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
302	334	SM0612-062116	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
998	882	I3248498	2028-06-10	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1006	694	H3318717	2028-09-02	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
993	686	5032071	2027-02-28	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
327	269	SM0612-062405	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
360	302	SM0612-062439	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
368	310	SM0612-062447	\N	12.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
369	311	SM0612-062448	\N	12.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
370	312	SM0612-062449	\N	12.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
371	313	SM0612-062450	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
373	315	SM0612-062452	\N	12.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
374	316	SM0612-062453	\N	12.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
378	320	SM0612-062457	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
379	321	SM0612-062461	\N	2.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
192	161	SM0612-062201	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
194	163	SM0612-062203	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
195	164	SM0612-062204	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
196	165	SM0612-062205	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
197	166	SM0612-062206	\N	30.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
1008	704	I3192257	2028-04-08	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
198	167	SM0612-062207	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
199	168	SM0612-062208	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
200	169	SM0612-062209	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
201	170	SM0612-062210	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
202	171	SM0612-062211	\N	8.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
203	172	SM0612-062212	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
204	173	SM0612-062213	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
205	174	SM0612-062214	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
206	175	SM0612-062215	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
207	176	SM0612-062216	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
208	177	SM0612-062217	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
209	178	SM0612-062218	\N	42.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
210	179	SM0612-062219	\N	42.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
211	180	SM0612-062220	\N	42.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
323	265	SM0612-062401	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
850	582	2025121802	2027-12-17	1.00	1.00	18	2026-06-02 15:40:53.240312	2026-06-02 15:40:53.240312	\N	\N	ACTIVO
326	268	SM0612-062404	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
330	272	SM0612-062408	\N	12.00	10.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
331	273	SM0612-062409	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
348	290	SM0612-062426	\N	6.00	5.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
361	303	SM0612-062440	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
364	306	SM0612-062443	\N	50.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
365	307	SM0612-062444	\N	50.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
366	308	SM0612-062445	\N	50.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
877	776	202503027	2030-08-31	10.00	0.00	27	2026-06-10 20:23:32.168744	2026-06-12 20:09:12.707425	\N	\N	ACTIVO
372	314	SM0612-062451	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
375	317	SM0612-062454	\N	12.00	2.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
376	318	SM0612-062455	\N	6.00	2.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
380	322	SM0612-062458	\N	2.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
381	323	SM0612-062459	\N	2.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
382	324	SM0612-062460	\N	2.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
212	181	SM0612-062221	\N	42.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
213	182	SM0612-062222	\N	42.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
214	183	SM0612-062223	\N	42.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
215	184	SM0612-062224	\N	42.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
216	185	SM0612-062225	\N	42.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
217	186	SM0612-062226	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
218	187	SM0612-062227	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
219	188	SM0612-062228	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
220	189	SM0612-062229	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
142	111	SM0612-062302	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
288	257	SM0612-062102	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
289	258	SM0612-062103	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
222	191	SM0612-062002	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
223	192	SM0612-062003	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
290	259	SM0612-062104	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
291	260	SM0612-062105	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
292	261	SM0612-062106	\N	13.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
293	262	SM0612-062107	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
294	263	SM0612-062108	\N	10.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
295	264	SM0612-062109	\N	15.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
903	796	0000072183	2028-05-02	1.00	0.00	35	2026-06-11 15:56:18.599102	2026-06-11 21:39:11.381521	\N	\N	ACTIVO
297	329	SM0612-062111	\N	42.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
298	330	SM0612-062112	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
299	331	SM0612-062113	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
300	332	SM0612-062114	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
301	333	SM0612-062115	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
303	335	SM0612-062117	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
304	336	SM0612-062118	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
305	337	SM0612-062119	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
306	338	SM0612-062120	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
902	795	775080	\N	4.00	2.00	35	2026-06-11 15:56:18.599102	2026-06-11 21:39:11.381521	\N	\N	ACTIVO
910	590	EFG78	2028-05-17	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
309	341	SM0612-062123	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
310	342	SM0612-062124	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
143	112	SM0612-062303	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
911	592	EFG82	2028-05-27	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
145	114	SM0612-062305	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
146	115	SM0612-062306	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
147	116	SM0612-062307	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
148	117	SM0612-062308	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
149	118	SM0612-062309	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
150	119	SM0612-062310	\N	25.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
151	120	SM0612-062311	\N	25.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
152	121	SM0612-062312	\N	30.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
153	122	SM0612-062313	\N	36.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
154	123	SM0612-062314	\N	30.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
155	124	SM0612-062315	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
912	588	EFG94	2028-06-14	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
913	593	EFG95	2028-06-26	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1368	632	PVLDCK13	2028-08-05	1.00	1.00	46	2026-06-18 20:36:26.752392	2026-06-18 20:36:26.752392	\N	\N	ACTIVO
156	125	SM0612-062316	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
311	343	SM0612-062125	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
312	344	SM0612-062126	\N	18.00	11.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
316	348	SM0612-062130	\N	18.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
317	349	SM0612-062131	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
318	350	SM0612-062132	\N	12.00	8.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
319	351	SM0612-062133	\N	12.00	8.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
320	352	SM0612-062134	\N	12.00	8.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
851	42	K3371732	2028-10-24	10.00	0.00	19	2026-06-02 17:33:01.643082	2026-06-04 21:47:41.168864	\N	\N	ACTIVO
322	354	SM0612-062136	\N	48.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
221	190	SM0612-062001	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
224	193	SM0612-062004	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
225	194	SM0612-062005	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
226	195	SM0612-062006	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
240	209	SM0612-062020	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
241	210	SM0612-062021	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
242	211	SM0612-062022	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
157	126	SM0612-062317	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
158	127	SM0612-062318	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
159	128	SM0612-062319	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
160	129	SM0612-062320	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
161	130	SM0612-062321	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
162	131	SM0612-062322	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
163	132	SM0612-062323	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
164	133	SM0612-062324	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
165	134	SM0612-062325	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
166	135	SM0612-062326	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
227	196	SM0612-062007	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
228	197	SM0612-062008	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
229	198	SM0612-062009	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
232	201	SM0612-062012	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
233	202	SM0612-062013	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
234	203	SM0612-062014	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
235	204	SM0612-062015	\N	12.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
191	160	SM0612-062352	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
852	43	K3396584	2028-11-22	20.00	0.00	19	2026-06-02 17:33:01.643082	2026-06-04 21:47:41.168864	\N	\N	ACTIVO
247	216	SM0612-062027	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
263	232	SM0612-062043	\N	30.00	23.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
264	233	SM0612-062044	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
270	239	SM0612-062051	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
905	798	MO14060356	\N	1.00	0.00	36	2026-06-11 19:44:50.177638	2026-06-11 21:50:20.265373	\N	\N	ACTIVO
286	255	SM0612-062066	\N	2.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
167	136	SM0612-062327	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
168	137	SM0612-062328	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
169	138	SM0612-062329	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
170	139	SM0612-062330	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
171	140	SM0612-062331	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
172	141	SM0612-062332	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
173	142	SM0612-062333	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
174	143	SM0612-062334	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
175	144	SM0612-062335	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
252	221	SM0612-062032	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
253	222	SM0612-062033	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
254	223	SM0612-062034	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
878	777	H25B00450463	\N	1.00	0.00	28	2026-06-10 20:32:08.783673	2026-06-12 20:17:20.965928	\N	\N	ACTIVO
259	228	SM0612-062039	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
265	234	SM0612-062045	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
266	235	SM0612-062046	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
267	236	SM0612-062047	\N	11.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
268	237	SM0612-062048	\N	13.00	1.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
176	145	SM0612-062336	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
177	146	SM0612-062337	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
178	147	SM0612-062338	\N	10.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
179	148	SM0612-062339	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
180	149	SM0612-062340	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
181	150	SM0612-062341	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
182	151	SM0612-062342	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
183	152	SM0612-062344	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
184	153	SM0612-062345	\N	19.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
185	154	SM0612-062346	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
186	155	SM0612-062347	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
187	156	SM0612-062348	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
879	778	360101-M25C09810051	\N	1.00	0.00	28	2026-06-10 20:32:08.783673	2026-06-12 20:24:25.622632	\N	\N	ACTIVO
189	158	SM0612-062350	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
190	159	SM0612-062351	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
904	797	MO14100167	\N	2.00	0.00	36	2026-06-11 19:44:50.177638	2026-06-12 20:03:33.58986	\N	\N	ACTIVO
915	588	EFG99	2028-06-21	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1369	681	S25TZAQOAB	2027-06-30	1.00	1.00	47	2026-06-18 20:47:47.484128	2026-06-18 20:47:47.484128	\N	\N	ACTIVO
918	591	EFH07	2028-06-28	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
919	595	EFH07	2028-06-28	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
245	214	SM0612-062025	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
255	224	SM0612-062035	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
257	226	SM0612-062037	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
271	240	SM0612-062052	\N	24.00	18.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
274	243	SM0612-062055	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
275	244	SM0612-062056	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
278	247	SM0612-062059	\N	24.00	9.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
280	249	SM0612-062067	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
281	250	SM0612-062061	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
283	252	SM0612-062063	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
285	254	SM0612-062065	\N	3.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
144	113	SM0612-062304	\N	36.00	11.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
188	157	SM0612-062349	\N	31.00	12.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
193	162	SM0612-062202	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
231	200	SM0612-062011	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
236	205	SM0612-062016	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
237	206	SM0612-062017	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
238	207	SM0612-062018	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
239	208	SM0612-062019	\N	12.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
243	212	SM0612-062023	\N	15.00	12.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
244	213	SM0612-062024	\N	6.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
246	215	SM0612-062026	\N	18.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
248	217	SM0612-062028	\N	6.00	1.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
249	218	SM0612-062029	\N	18.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
250	219	SM0612-062030	\N	12.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
251	220	SM0612-062031	\N	6.00	2.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
258	227	SM0612-062038	\N	48.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
262	231	SM0612-062042	\N	30.00	16.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
272	241	SM0612-062053	\N	12.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
273	242	SM0612-062054	\N	12.00	4.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
276	245	SM0612-062057	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
277	246	SM0612-062058	\N	25.00	12.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
279	248	SM0612-062060	\N	24.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
296	328	SM0612-062110	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
307	339	SM0612-062121	\N	132.00	86.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
308	340	SM0612-062122	\N	18.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
313	345	SM0612-062127	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
314	346	SM0612-062128	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
315	347	SM0612-062129	\N	18.00	4.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
321	353	SM0612-062135	\N	12.00	3.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
324	266	SM0612-062402	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
328	270	SM0612-062406	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
333	275	SM0612-062411	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
336	278	SM0612-062414	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
338	280	SM0612-062416	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
351	293	SM0612-062429	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
359	301	SM0612-062438	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
362	304	SM0612-062441	\N	36.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
363	305	SM0612-062442	\N	24.00	6.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
367	309	SM0612-062446	\N	12.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
377	319	SM0612-062456	\N	6.00	0.00	9	2026-05-26 00:23:00.590089	2026-05-29 17:54:09.351306	\N	\N	ACTIVO
853	583	4100272	2026-09-30	5.00	0.00	20	2026-06-02 21:45:11.652616	2026-06-04 21:47:41.168864	\N	\N	ACTIVO
854	584	I3455577	2029-02-26	8.00	0.00	20	2026-06-02 21:45:11.652616	2026-06-04 21:47:41.168864	\N	\N	ACTIVO
880	779	URS5070060	2027-09-10	10.00	10.00	29	2026-06-10 20:41:25.305129	2026-06-10 20:41:25.305129	\N	\N	ACTIVO
906	799	CR-3C275446	\N	1.00	0.00	37	2026-06-11 20:05:38.266809	2026-06-12 19:53:20.388098	\N	\N	ACTIVO
907	800	CR-3C275447	\N	1.00	0.00	37	2026-06-11 20:05:38.266809	2026-06-12 19:53:20.388098	\N	\N	ACTIVO
920	598	EFH09	2028-07-01	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
921	594	EFH10	2028-06-30	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
922	597	EFH10	2028-06-30	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
923	596	EFH13	2028-07-02	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
924	606	EFH13	2028-07-02	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1371	659	S25TZALJAC	2027-05-31	1.00	1.00	47	2026-06-18 20:47:47.484128	2026-06-18 20:47:47.484128	\N	\N	ACTIVO
926	612	EFH17	2028-07-10	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
927	604	EFH18	2028-07-10	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
928	605	EFH19	2028-07-11	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
929	597	EFH20	2028-07-11	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
930	616	EFH23	2028-07-24	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
931	617	EFH23	2028-07-24	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
932	601	EFH24	2028-07-23	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
933	602	EFH24	2028-07-23	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
934	610	EFH25	2028-07-24	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
935	611	EFH26	2028-07-25	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
936	615	EFH29	2028-08-07	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
937	600	EFH30	2028-08-06	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
938	614	EFH31	2028-08-07	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
939	599	EFH32	2028-08-08	16.00	16.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
940	607	EFH32	2028-08-08	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
941	603	EFH33	2028-08-11	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
942	613	EFH33	2028-08-11	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
943	609	EFH34	2028-08-11	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
944	608	EFH35	2028-09-04	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1370	683	S25TZANIAA	2027-05-31	2.00	2.00	47	2026-06-18 20:47:47.484128	2026-06-18 20:47:47.484128	\N	\N	ACTIVO
1372	681	S25TZAQSAA	2027-06-30	1.00	1.00	47	2026-06-18 20:47:47.484128	2026-06-18 20:47:47.484128	\N	\N	ACTIVO
1373	717	202512604	2028-12-10	1.00	1.00	47	2026-06-18 20:47:47.484128	2026-06-18 20:47:47.484128	\N	\N	ACTIVO
1374	845	250910	2028-02-29	10.00	10.00	48	2026-06-18 21:17:00.009799	2026-06-18 21:17:00.009799	\N	\N	ACTIVO
1147	699	PMTDF65	2027-09-15	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1070	698	PMTDF66	2027-09-16	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1090	877	2504259336	2028-04-24	34.00	34.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1149	698	PMTDF69	2027-09-20	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1073	633	PMTVD19	2028-07-18	22.00	22.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1151	636	PMTVD29	2028-09-27	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1152	635	PMTVD31	2028-10-02	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1153	634	PMTVD34	2028-10-09	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1108	585	EFH23	2028-07-24	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1114	615	EFH42	2028-09-27	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1127	616	EFH51	2028-10-14	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1129	593	EFH53	2028-11-12	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1142	696	MVC21	2027-11-20	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1144	618	MVC22	2027-11-20	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1150	625	PMTDF70	2027-09-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1154	637	POBC24	2026-08-11	42.00	42.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1155	637	POBC25	2026-08-11	78.00	78.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1156	638	POBC35	2026-09-26	40.00	40.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1003	686	5080571	2027-07-31	11.00	11.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1002	689	2309-0232	2026-08-31	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1159	730	250409A051	2028-03-31	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1082	708	250411A101	2028-03-31	28.00	28.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1093	724	25A107	2028-02-17	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1096	727	25A554	2028-08-03	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1099	723	25A575	2028-09-14	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1375	713	202511609	2028-11-02	195.00	195.00	49	2026-06-18 21:26:14.618097	2026-06-18 21:26:14.618097	\N	\N	ACTIVO
994	705	H3201753	2028-04-26	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1005	733	H3283983	2028-08-08	13.00	13.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
997	687	I3232620	2028-05-26	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1180	889	SP4125022805	2028-03-02	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1162	732	S25A1A101A	2027-12-31	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1022	685	S25TZALPAA	2027-05-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1172	741	24A361	2027-06-17	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1092	725	24A643	2027-09-12	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1094	720	25A251	2028-06-29	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1173	724	25A552	2028-08-24	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1095	726	25A553	2028-08-24	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1097	721	25A558	2028-08-24	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1174	743	25A567	2028-08-17	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1175	739	25A572	2028-09-14	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1176	742	25A725	2028-11-23	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1177	740	25A763	2028-11-23	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1178	662	S25TZAFLAA	2027-06-30	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1163	713	202511609	2028-11-02	345.00	345.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1100	728	LE240966	2029-08-31	34.00	34.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1165	738	2024110201IF	2026-11-01	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1087	702	2510227458	2028-10-22	929.00	929.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1009	656	P25TZAEZAA	2027-05-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1010	685	P25TZAFIAA	2027-05-31	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
968	662	P25TZAFLAA	2027-06-30	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1012	669	P25TZAFXAD	2027-06-30	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1016	670	P25TZAGRAF	2027-07-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1017	643	P25TZAGYAD	2027-07-31	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1018	680	P25TZAHLAA	2027-08-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
972	682	S25TZAJPAB	2027-04-30	11.00	11.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1019	683	S25TZAJYAD	2027-04-30	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1020	682	S25TZAKHAC	2027-04-30	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1023	666	S25TZALWAB	2027-05-31	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1024	644	S25TZAMAAB	2027-05-31	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1025	646	S25TZAMXAD	2027-05-31	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1026	649	S25TZAMZAA	2027-05-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1027	665	S25TZANGAA	2027-05-31	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1028	668	S25TZANGAA	2027-05-31	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1029	683	S25TZANIAA	2027-05-31	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1030	650	S25TZANRAA	2027-05-31	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1031	657	S25TZAOAAB	2027-06-30	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1032	672	S25TZAOCAC	2027-05-31	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1033	671	S25TZAOIAB	2027-06-30	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1376	653	S25TZAOZAB	2027-06-30	1.00	1.00	50	2026-06-18 21:36:37.42468	2026-06-18 21:36:37.42468	\N	\N	ACTIVO
1035	658	S25TZAOOAA	2027-06-30	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1036	653	S25TZAOZAB	2027-06-30	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1037	651	S25TZAPAAC	2027-06-30	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1377	659	S25TZALJAC	2027-05-31	1.00	1.00	50	2026-06-18 21:36:37.42468	2026-06-18 21:36:37.42468	\N	\N	ACTIVO
1378	661	P25TZAGDAB	2027-05-31	1.00	1.00	50	2026-06-18 21:36:37.42468	2026-06-18 21:36:37.42468	\N	\N	ACTIVO
1040	681	S25TZAPJAA	2027-06-30	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1379	671	S25TZAOIAB	2027-05-31	1.00	1.00	50	2026-06-18 21:36:37.42468	2026-06-18 21:36:37.42468	\N	\N	ACTIVO
1041	652	S25TZAPKAA	2027-06-30	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1042	667	S25TZAPPAB	2027-06-30	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1043	664	S25TZAPTAD	2027-07-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1044	654	S25TZAPYAA	2027-06-30	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1380	617	EFH56	2027-06-30	1.00	1.00	50	2026-06-18 21:36:37.42468	2026-06-18 21:36:37.42468	\N	\N	ACTIVO
1046	681	S25TZAQSAA	2027-06-30	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1047	675	S25TZARIAE	2027-07-31	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1050	674	S25TZARPAC	2027-07-31	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1051	680	S25TZARQAE	2027-07-31	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1052	663	S25TZARYAB	2027-07-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1053	642	S25TZASCAL	2027-07-31	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1055	641	S25TZASDAJ	2027-07-31	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1058	639	S25TZAUFAG	2027-07-31	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1183	621	MVC25	2027-12-22	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1184	696	MVC26	2027-12-22	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1185	624	MVC26	2027-12-22	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1186	695	MVC27	2027-12-23	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1188	618	MVC28	2028-01-01	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1189	628	PMTDF63	2027-08-25	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1190	630	PMTDF70	2027-09-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1191	699	PMTDF71	2027-09-25	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1192	627	PMTDF73	2027-09-28	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1193	697	PMTDF74	2027-09-30	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1195	625	PMTDF80	2027-12-06	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1196	633	PMTVD23	2028-07-31	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1197	636	PMTVD35	2028-10-14	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1199	634	PMTVD40	2028-12-07	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1200	631	PPHTC88	2027-12-29	50.00	50.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1201	632	PVLDCK38	2028-10-08	50.00	50.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
982	680	S25TZANFAD	2027-05-31	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
986	641	S25TZAONAF	2027-06-30	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
988	643	S25TZAQWAF	2027-07-31	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
989	680	S25TZASCAC	2027-07-31	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1204	735	250625	2028-05-31	25.00	25.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1205	734	S23E1E111A	2026-04-30	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1141	619	MVC20	2027-11-10	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1381	746	251224A291	2028-12-31	10.00	10.00	51	2026-06-18 21:45:17.982226	2026-06-18 21:45:17.982226	\N	\N	ACTIVO
1382	842	260327A121	2029-03-31	10.00	10.00	51	2026-06-18 21:45:17.982226	2026-06-18 21:45:17.982226	\N	\N	ACTIVO
1161	737	BLS457250201	2028-02-01	19.00	19.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1207	747	251219A191	2028-11-30	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1208	745	251224A021	2028-12-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1209	746	251224A041	2028-12-31	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1124	607	EFH48	2028-10-04	17.00	17.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1210	748	S25F1F102A	2028-05-31	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1212	751	250623	2027-11-30	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1213	749	250723	2028-06-30	50.00	50.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
948	624	MVC11	2027-09-16	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1085	752	202504042	2028-05-06	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1143	621	MVC21	2027-11-20	11.00	11.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1145	620	MVC23	2027-12-04	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1072	627	PMTDF68	2027-09-20	21.00	21.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1157	631	PPHTC79	2027-12-05	57.00	57.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
964	632	PVLDCK14	2028-08-06	7.00	7.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1216	755	2510227463	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1217	756	2510227466	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1219	803	2510227468	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1223	807	2510227472	2027-10-22	50.00	50.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1224	808	2510227473	2027-10-22	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1226	810	2510227475	2027-10-22	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1227	811	2510227476	2027-10-22	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1230	814	2510227479	2027-10-22	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1231	815	2510227480	2027-10-22	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1232	816	2510227481	2027-10-22	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1235	819	2510227484	2027-10-22	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1236	820	2510227485	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1243	827	2510227492	2027-10-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1248	700	2601300575	2029-01-30	160.00	160.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1139	622	MVC18	2027-10-13	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1249	832	9952785	2028-08-25	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1250	832	10094788	2028-11-02	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1060	619	MVC16	2027-10-06	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1187	620	MVC27	2027-12-23	13.00	13.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1071	626	PMTDF67	2027-09-17	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1194	698	PMTDF74	2027-09-30	13.00	13.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
975	642	S25TZALOAJ	2027-05-31	7.00	7.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
987	647	S25TZAPKAA	2027-06-30	26.00	26.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1059	622	MVC14	2027-09-27	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1252	833	250403A261	2028-03-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1063	695	MVC19	2027-10-15	11.00	11.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1146	697	PMTDF63	2027-08-25	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1160	731	2501-0324	2027-12-31	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1383	606	EFH47	2028-10-04	1.00	1.00	52	2026-06-18 21:57:12.389588	2026-06-18 21:57:12.389588	\N	\N	ACTIVO
1384	684	S25TZASMAC	2027-07-31	1.00	1.00	52	2026-06-18 21:57:12.389588	2026-06-18 21:57:12.389588	\N	\N	ACTIVO
1158	632	PVLDCK25	2028-09-05	52.00	52.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1253	881	I3304184	2028-08-31	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1254	891	I3356223	2028-10-27	7.00	7.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1261	643	P25TZAQWAF	2027-07-31	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1101	729	S25A1A101A	2027-12-31	44.00	44.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
977	653	S25TZAMAAB	2027-05-31	7.00	7.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
985	639	S25TZAOJAA	2027-06-30	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1148	626	PMTDF69	2027-09-20	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1265	717	202603608	2029-03-19	600.00	600.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1255	891	I3356227	2028-11-11	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1256	881	I3370429	2028-10-10	21.00	21.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1164	714	202512604	2028-12-10	1530.00	1530.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1257	883	K3371675	2028-10-24	80.00	80.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1203	736	250624	2028-05-31	55.00	55.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1267	835	2603201425	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1268	753	2603201426	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1269	754	2603201432	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1270	755	2603201437	2028-03-21	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1271	756	2603201444	2028-03-21	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1272	802	2603201453	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1273	803	2603201456	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1274	804	2603201457	2028-03-21	19.00	19.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1275	805	2603201459	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1276	806	2603201470	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1277	808	2603201479	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1278	809	2603201481	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1279	810	2603201484	2028-03-21	17.00	17.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1280	811	2603201494	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1281	812	2603201495	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1282	813	2603201503	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1283	814	2603201509	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1284	815	2603201514	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1285	816	2603201515	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1286	817	2603201521	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1287	819	2603201522	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1288	820	2603201530	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1289	821	2603201533	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1290	822	2603201536	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1291	823	2603201544	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1292	836	2603201545	2028-03-21	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1293	824	2603201546	2028-03-21	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1294	825	2603201547	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1295	826	2603201550	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1296	837	2603201551	2028-03-21	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1297	827	2603201552	2028-03-21	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1298	828	2603201554	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1299	829	2603201555	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1300	830	2603201556	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1301	831	2603201557	2028-03-21	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1081	706	E4747855	2030-09-02	15.00	15.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1302	838	2310-0379	2026-09-30	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1258	892	K3371732	2028-10-24	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1179	878	SP1125081407	2028-08-19	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
946	622	MVC10	2027-09-15	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
953	628	PMTDF57	2027-07-31	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1266	834	SL240047	2029-09-30	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1262	893	H2735360	2026-08-04	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1263	894	H3247331	2028-02-28	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1264	891	I3304488	2028-08-18	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1303	895	6021241	2027-12-31	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1304	882	I3356253	2028-10-20	15.00	15.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1307	839	241111A011	2027-10-31	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
945	623	MVC08	2027-09-03	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1067	629	PMTDF61	2027-08-20	7.00	7.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1140	624	MVC19	2027-10-15	7.00	7.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
954	630	PMTDF59	2027-08-06	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
950	619	MVC13	2027-09-27	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1251	626	PMTDF52	2027-07-09	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1309	623	MVB85	2027-05-15	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1182	622	MVC21	2027-11-20	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1310	619	MVC24	2027-12-05	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1311	620	MVC25	2027-12-22	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1312	629	PMTDF26	2027-02-21	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1313	841	PMTDF63	2027-08-25	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1314	698	PMTDF73	2027-09-28	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1315	626	PMTDF76	2027-10-24	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
959	633	PMTVD14	2028-07-05	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1316	634	PMTVD36	2028-10-16	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1198	635	PMTVD37	2028-11-03	13.00	13.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
962	631	PPHTC61	2027-09-20	20.00	20.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
963	632	PVLDCK13	2028-08-05	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1317	708	251224A061	2028-12-31	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1318	746	251224A291	2028-12-31	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1319	842	260327A121	2029-03-31	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1206	744	2025112601IF	2028-11-25	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1084	707	S23F1F104A	2026-05-31	24.00	24.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1211	750	250516	2027-10-31	20.00	20.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1320	751	250923	2028-02-29	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1321	736	251022	2028-09-30	55.00	55.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1322	700	2604227464	2029-04-21	500.00	500.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1323	843	20260109R	2028-12-31	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1324	713	202604635	2029-04-27	200.00	200.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1325	717	202604636	2029-04-27	500.00	500.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1326	622	MVC41	2028-02-18	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1327	620	MVC44	2028-03-09	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1328	696	MVC45	2028-03-09	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1329	619	MVC45	2028-03-09	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1330	621	MVC46	2028-03-17	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1331	621	MVC49	2028-04-01	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1332	620	MVC51	2028-04-13	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1333	628	PMTDF85	2028-01-09	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1334	844	PMTDF89	2028-02-17	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1335	627	PMTDF91	2028-02-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1336	698	PMTDF93	2028-02-29	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1337	626	PMTDF94	2028-03-01	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1338	698	PMTDF96	2028-03-29	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1339	633	PMTVD46	2028-12-30	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1340	636	PMTVD58	2029-02-20	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1341	635	PMTVD64	2029-03-06	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1342	634	PMTVD65	2029-03-10	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1343	636	PMTVD74	2029-04-13	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1344	631	PPHTD16	2028-03-11	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1345	631	PPHTD25	2028-04-07	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1346	632	PVLDCK69	2029-01-17	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1347	632	PVLDCK70	2029-01-19	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1348	632	PVLDCK74	2029-01-30	11.00	11.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1349	845	250910	2028-02-29	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
914	586	EFG99	2028-06-21	30.00	30.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1202	880	SP5325041706	2028-04-15	48.00	48.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1104	590	EFH06	2028-06-27	13.00	13.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1106	591	EFH17	2028-07-10	15.00	15.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1110	612	EFH26	2028-07-25	13.00	13.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1111	596	EFH39	2028-09-26	13.00	13.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1126	602	EFH50	2028-10-13	15.00	15.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1131	711	EFH56	2028-11-14	7.00	7.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1308	840	2405-0167	2027-04-30	19.00	19.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1350	846	SL241428	2027-02-28	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1088	703	2510227459	2028-10-22	1441.00	1441.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1089	700	2510227462	2028-10-21	631.00	631.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1021	659	S25TZALJAC	2027-05-31	20.00	20.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1045	681	S25TZAQOAB	2027-06-30	10.00	10.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1049	660	S25TZARNAC	2027-07-31	20.00	20.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1259	877	2511114218	2028-11-10	30.00	30.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1351	878	SP1125121506	2028-12-23	20.00	20.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1214	753	2510227457	2027-10-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1215	754	2510227461	2027-10-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1218	802	2510227467	2027-10-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1220	804	2510227469	2027-10-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1221	805	2510227470	2027-10-22	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1222	806	2510227471	2027-10-22	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1225	809	2510227474	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1228	812	2510227477	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1229	813	2510227478	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1233	817	2510227482	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1234	818	2510227483	2027-10-22	2.00	2.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1237	821	2510227486	2027-10-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1238	822	2510227487	2027-10-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1239	823	2510227488	2027-10-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1240	824	2510227489	2027-10-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1241	825	2510227490	2027-10-22	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1242	826	2510227491	2027-10-22	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1244	828	2510227493	2027-10-22	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1245	829	2510227494	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1246	830	2510227495	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1247	831	2510227496	2027-10-22	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1353	617	EFG22	2027-09-09	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1102	592	EFG94	2028-06-14	22.00	22.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
916	587	EFH05	2028-06-26	37.00	37.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1103	588	EFH06	2028-06-27	18.00	18.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
917	589	EFH07	2028-06-28	18.00	18.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1105	595	EFH10	2028-06-30	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
925	585	EFH14	2028-07-05	23.00	23.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1107	710	EFH18	2028-07-10	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1109	593	EFH23	2028-07-24	18.00	18.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1112	603	EFH40	2028-09-25	16.00	16.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1113	615	EFH41	2028-09-27	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1115	597	EFH43	2028-09-30	16.00	16.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1116	598	EFH43	2028-09-30	22.00	22.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1117	709	EFH44	2028-10-01	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1118	601	EFH44	2028-10-01	16.00	16.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1119	604	EFH44	2028-10-01	22.00	22.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1120	594	EFH45	2028-10-01	22.00	22.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1121	609	EFH45	2028-10-01	12.00	12.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1122	610	EFH45	2028-10-01	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1123	606	EFH47	2028-10-04	23.00	23.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1125	616	EFH48	2028-10-04	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1128	712	EFH51	2028-10-14	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1130	617	EFH56	2028-11-14	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1132	599	EFH59	2028-11-14	22.00	22.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1133	600	EFH59	2028-11-14	22.00	22.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1134	605	EFH60	2028-11-15	22.00	22.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1135	613	EFH62	2028-11-17	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1136	608	EFH63	2028-11-17	16.00	16.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1137	611	EFH63	2028-11-17	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1138	614	EFH64	2028-11-18	14.00	14.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1260	879	SP5324121808	2027-12-18	17.00	17.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1352	880	SP5325082210	2028-08-23	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1305	896	I3385327	2028-09-30	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1306	883	K3377984	2028-11-01	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1091	876	2506106166	2028-06-09	64.00	64.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1354	590	EHF06	2028-06-27	1.00	1.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1011	648	P25TZAFWAA	2027-06-30	7.00	7.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1013	655	P25TZAGBAB	2027-06-30	11.00	11.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1014	661	P25TZAGDAB	2027-06-30	21.00	21.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1015	645	P25TZAGGAD	2027-06-30	11.00	11.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1034	676	S25TZAOLAB	2027-06-30	5.00	5.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1038	678	S25TZAPGAB	2027-06-30	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1039	679	S25TZAPGAB	2027-06-30	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1048	673	S25TZARJAC	2027-07-31	7.00	7.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1054	640	S25TZASDAB	2027-07-31	9.00	9.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
990	684	S25TZASMAC	2027-07-31	21.00	21.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1056	684	S25TZATHAD	2027-07-31	11.00	11.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1057	677	S25TZAUAAG	2027-07-31	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1166	884	SP1124052316	2027-06-18	20.00	20.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1167	885	SP4125022813	2028-03-02	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1181	890	SP4125031203	2028-03-19	8.00	8.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1168	886	SP4125080402	2028-08-05	3.00	3.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1169	887	SP5024091403	2027-09-23	4.00	4.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1170	888	SP5025090304	2028-09-03	6.00	6.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1171	880	SP5325022829	2028-03-02	23.00	23.00	39	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	\N	\N	ACTIVO
1385	585	EFH14	2028-07-05	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1386	586	EFG99	2028-06-21	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1387	587	EFH05	2028-06-26	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1388	642	S25TZASCAL	2027-07-31	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1389	589	EFH07	2028-06-28	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1390	645	P25TZAGGAD	2027-06-30	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1391	593	EFH23	2028-07-24	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1392	648	P25TZAFWAA	2027-06-30	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1393	650	S25TZANRAA	2027-05-31	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1394	651	S25TZAPAAC	2027-06-30	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1395	652	S25TZAPKAA	2027-06-30	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1396	653	S25TZAOZAB	2027-06-30	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1397	602	EFH50	2028-10-13	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1398	683	S25TZAJYAD	2027-04-30	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1399	604	EFH44	2028-10-01	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1400	608	EFH63	2028-11-17	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1401	611	EFH63	2028-11-17	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1402	613	EFH62	2028-11-17	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1403	614	EFH64	\N	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1404	615	EFH42	2028-09-27	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
1405	672	S25TZAOCAC	2027-05-31	1.00	1.00	53	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	\N	\N	ACTIVO
\.


--
-- Data for Name: nota_ingreso_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_ingreso_detalles (id, nota_ingreso_id, producto_id, lote_numero, fecha_vencimiento, um, fabricante, temperatura_min_c, temperatura_max_c, cantidad, precio_unitario, cantidad_bultos, cantidad_cajas, cantidad_por_caja, cantidad_fraccion, cantidad_total, created_at) FROM stdin;
1	1	1	99532	2028-04-01	UND	INDUSTRIE PAGODA SRL	15.00	25.00	10400.00	\N	1.00	1.00	10400.00	0.00	10400.00	2026-05-21 06:48:17.996923
2	1	2	99530	2028-04-01	UND	INDUSTRIE PAGODA SRL	15.00	25.00	4000.00	\N	1.00	1.00	4000.00	0.00	4000.00	2026-05-21 06:48:17.996923
3	1	3	FST25062001	2028-06-20	UND	AMERICAN INTERNATIONAL INDUSTRIES	15.00	25.00	1200.00	\N	1.00	1.00	1200.00	0.00	1200.00	2026-05-21 06:48:17.996923
4	1	4	SP5324050510	2027-05-06	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-21 06:48:17.996923
5	1	5	SP5324091912	2027-09-19	UND	JOSSON MEDICAL EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-21 06:48:17.996923
6	1	6	SP1124041023	2027-04-14	UND	JOSSON MEDICAL EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-21 06:48:17.996923
7	1	6	SP1124041531	2027-06-30	UND	JOSSON MEDICAL ERIL	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-05-21 06:48:17.996923
8	1	6	SP1124052316	2027-06-18	UND	JOSSON MEDICAL EIRL	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-05-21 06:48:17.996923
9	1	4	SP5324050510	2027-05-06	UND	JOSSON MEDICAL EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-21 06:48:17.996923
10	1	4	SP5325022823	2028-03-02	UND	JOSSON MEDICAL EIRL	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-05-21 06:48:17.996923
11	1	5	SP5324091912	2027-09-19	UND	JOSSON MEDICAL EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-21 06:48:17.996923
12	1	7	SP4125051505	2028-05-18	UND	JOSSON MEDICAL EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-21 06:48:17.996923
13	1	8	SP4124040324	2027-04-07	UND	JOSSON MEDICAL EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-21 06:48:17.996923
14	1	4	SP5325022823	2028-03-02	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-21 06:48:17.996923
15	1	6	SP1124041531	2027-06-30	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-21 06:48:17.996923
16	1	9	SP1124092024	2027-10-07	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-21 06:48:17.996923
17	1	4	SP5325022823	2028-03-02	UND	JOSSON MEDICAL EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-21 06:48:17.996923
18	1	6	SP1124041531	2027-06-30	UND	JOSSON MEDICAL EIRL	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-05-21 06:48:17.996923
19	1	5	SP5324091912	2027-09-19	UND	JOSSON MEDICAL EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-21 06:48:17.996923
20	1	7	SP4125051505	2028-05-18	UND	JOSSON MEDICAL EIRL	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-21 06:48:17.996923
21	1	10	SP4125080402	2028-08-05	UND	JOSSON MEDICAL EIRL	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-21 06:48:17.996923
22	1	11	33998	2028-06-27	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	60.00	\N	1.00	1.00	60.00	0.00	60.00	2026-05-21 06:48:17.996923
23	1	12	34047	2028-06-13	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	120.00	\N	1.00	1.00	120.00	0.00	120.00	2026-05-21 06:48:17.996923
24	1	13	32965	2028-04-11	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	90.00	\N	1.00	1.00	90.00	0.00	90.00	2026-05-21 06:48:17.996923
25	1	14	34985	2028-09-30	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	120.00	\N	1.00	1.00	120.00	0.00	120.00	2026-05-21 06:48:17.996923
26	1	15	34415	2028-07-10	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	120.00	\N	1.00	1.00	120.00	0.00	120.00	2026-05-21 06:48:17.996923
27	1	16	34413	2027-07-08	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	200.00	\N	1.00	1.00	200.00	0.00	200.00	2026-05-21 06:48:17.996923
28	1	17	35088	2027-10-13	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	400.00	\N	1.00	1.00	400.00	0.00	400.00	2026-05-21 06:48:17.996923
29	1	18	34374	2027-07-04	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	160.00	\N	1.00	1.00	160.00	0.00	160.00	2026-05-21 06:48:17.996923
30	1	19	34525	2027-07-18	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	150.00	\N	1.00	1.00	150.00	0.00	150.00	2026-05-21 06:48:17.996923
31	1	20	35133	2027-10-14	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	90.00	\N	1.00	1.00	90.00	0.00	90.00	2026-05-21 06:48:17.996923
32	1	21	32781	2028-04-01	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	87.00	\N	1.00	1.00	87.00	0.00	87.00	2026-05-21 06:48:17.996923
33	1	22	34689	2027-08-12	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	100.00	\N	1.00	1.00	100.00	0.00	100.00	2026-05-21 06:48:17.996923
34	1	23	34919	2027-09-09	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	100.00	\N	1.00	1.00	100.00	0.00	100.00	2026-05-21 06:48:17.996923
35	1	24	35201	2027-10-16	UND	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	15.00	25.00	90.00	\N	1.00	1.00	90.00	0.00	90.00	2026-05-21 06:48:17.996923
36	1	4	SP5325022829	2028-03-02	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-21 06:48:17.996923
37	1	6	SP1124052316	2027-06-18	UND	JOSSON MEDICAL EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-21 06:48:17.996923
38	1	7	SP4125031203	2028-03-19	UND	JOSSON MEDICAL EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-21 06:48:17.996923
39	1	8	SP4125022813	2028-03-02	UND	JOSSON MEDICAL EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-21 06:48:17.996923
40	1	10	SP4125080402	2028-08-05	UND	JOSSON MEDICAL EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-21 06:48:17.996923
41	1	25	SP5024091403	2027-09-23	UND	JOSSON MEDICAL EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-21 06:48:17.996923
42	1	26	SP5025090304	2028-09-03	UND	JOSSON MEDICAL EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-21 06:48:17.996923
43	1	27	VM03	2029-05-31	UND	KIN COSMETICS S.A.U.	15.00	25.00	48.00	\N	1.00	1.00	48.00	0.00	48.00	2026-05-21 06:48:17.996923
44	1	28	SM04	2029-07-31	UND	KIN COSMETICS S.A.U.	15.00	25.00	48.00	\N	1.00	1.00	48.00	0.00	48.00	2026-05-21 06:48:17.996923
45	1	29	VM03	2029-05-31	UND	KIN COSMETICS S.A.U.	15.00	25.00	48.00	\N	1.00	1.00	48.00	0.00	48.00	2026-05-21 06:48:17.996923
46	1	30	VM03/38	2029-05-31	UND	KIN COSMETICS S.A.U.	15.00	25.00	36.00	\N	1.00	1.00	36.00	0.00	36.00	2026-05-21 06:48:17.996923
47	1	31	PL02/17	2028-10-31	UND	KIN COSMETICS S.A.U.	15.00	25.00	36.00	\N	1.00	1.00	36.00	0.00	36.00	2026-05-21 06:48:17.996923
48	1	32	TM04/64	2029-06-30	UND	KIN COSMETICS S.A.U.	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-21 06:48:17.996923
49	1	33	VM03	2029-05-31	UND	KIN COSMETICS S.A.U.	15.00	25.00	36.00	\N	1.00	1.00	36.00	0.00	36.00	2026-05-21 06:48:17.996923
50	1	34	SM04	2029-07-31	UND	KIN COSMETICS S.A.U.	15.00	25.00	90.00	\N	1.00	1.00	90.00	0.00	90.00	2026-05-21 06:48:17.996923
51	1	35	VM03	2029-05-31	UND	KIN COSMETICS S.A.U.	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-21 06:48:17.996923
52	1	36	VM03/38	2029-05-31	UND	KIN COSMETICS S.A.U.	15.00	25.00	90.00	\N	1.00	1.00	90.00	0.00	90.00	2026-05-21 06:48:17.996923
53	1	9	SP1125081407	2028-08-19	UND	JOSSON MEDICAL EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-21 06:48:17.996923
54	1	4	SP5325022829	2028-03-02	UND	JOSSON MEDICAL EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-21 06:48:17.996923
55	1	6	SP1124052316	2027-06-18	UND	JOSSON MEDICAL EIRL	15.00	25.00	14.00	\N	1.00	1.00	14.00	0.00	14.00	2026-05-21 06:48:17.996923
56	1	37	SP4125022805	2028-03-02	UND	JOSSON MEDICAL EIRL	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-21 06:48:17.996923
57	1	7	SP4125031203	2028-03-19	UND	JOSSON MEDICAL EIRL	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-21 06:48:17.996923
58	1	26	SP5025090304	2028-09-03	UND	JOSSON MEDICAL EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-21 06:48:17.996923
59	1	38	202510	3000-01-01	UND	NINGBO MARKET UNION GROUP	15.00	25.00	180.00	\N	1.00	1.00	180.00	0.00	180.00	2026-05-21 06:48:17.996923
60	1	39	202510	3000-01-02	UND	NINGBO MARKET UNION GROUP	15.00	25.00	72.00	\N	1.00	1.00	72.00	0.00	72.00	2026-05-21 06:48:17.996923
61	1	40	202510	3000-01-02	UND	TENSUN NETWORK CO.,LTD	15.00	25.00	120.00	\N	1.00	1.00	120.00	0.00	120.00	2026-05-21 06:48:17.996923
62	1	38	202510	3000-01-02	UND	TENSUN NETWORK CO.,LTD	15.00	25.00	288.00	\N	1.00	1.00	288.00	0.00	288.00	2026-05-21 06:48:17.996923
63	1	39	202510	3000-01-02	UND	TENSUN NETWORK CO.,LTD	15.00	25.00	288.00	\N	1.00	1.00	288.00	0.00	288.00	2026-05-21 06:48:17.996923
64	1	4	SP5325041706	2028-04-15	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-21 06:48:17.996923
65	1	4	SP5325041706	2028-04-15	UND	JOSSON MEDICAL EIRL	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-05-21 06:48:17.996923
66	1	41	I3370429	2028-10-10	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	21.00	\N	1.00	1.00	21.00	0.00	21.00	2026-05-21 06:48:17.996923
67	1	42	K3371732	2028-10-24	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-21 06:48:17.996923
68	1	43	K3371675	2028-10-24	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	80.00	\N	1.00	1.00	80.00	0.00	80.00	2026-05-21 06:48:17.996923
69	1	44	I3356227	2028-11-11	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-05-21 06:48:17.996923
70	1	41	I3304184	2028-08-31	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-05-21 06:48:17.996923
71	1	44	I3356223	2028-10-27	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-05-21 06:48:17.996923
72	1	9	SP1125081407	2028-08-19	UND	JOSSON MEDICAL EIRL	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-05-21 06:48:17.996923
73	1	5	SP5324121808	2027-12-18	UND	JOSSON MEDICAL EIRL	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-05-21 06:48:17.996923
74	1	4	SP5325041706	2028-04-15	UND	JOSSON MEDICAL EIRL	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-05-21 06:48:17.996923
75	1	45	2511114218	2028-11-10	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-21 06:48:17.996923
76	1	46	2506106166	2028-06-09	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-21 06:48:17.996923
77	1	44	I3304488	2028-08-18	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-21 06:48:17.996923
78	1	47	H2735360	2026-08-04	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-21 06:48:17.996923
79	1	48	H3247331	2028-02-28	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-21 06:48:17.996923
80	1	4	SP5325041706	2028-04-15	UND	JOSSON MEDICAL EIRL	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-05-21 06:48:17.996923
81	1	45	2511114218	2028-11-10	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-21 06:48:17.996923
82	1	46	2506106166	2028-06-09	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-21 06:48:17.996923
83	1	5	SP5324121808	2027-12-18	UND	JOSSON MEDICAL EIRL	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-21 06:48:17.996923
84	1	49	I3385327	2028-09-30	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-21 06:48:17.996923
85	1	43	K3377984	2028-11-01	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-05-21 06:48:17.996923
86	1	50	I3356253	2028-10-20	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-05-21 06:48:17.996923
87	1	51	6021241	2027-12-31	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-21 06:48:17.996923
88	2	52	2511090101	2029-11-24	UND	SUAVINEX GROUP, S.L	15.00	25.00	1404.00	\N	1.00	1.00	1404.00	0.00	1404.00	2026-05-21 18:15:35.017837
89	2	53	2511047801	2029-11-25	UND	SUAVINEX GROUP, S.L	15.00	25.00	432.00	\N	1.00	1.00	432.00	0.00	432.00	2026-05-21 18:15:35.017837
90	2	53	2510043501	2029-10-15	UND	SUAVINEX GROUP, S.L	15.00	25.00	108.00	\N	1.00	1.00	108.00	0.00	108.00	2026-05-21 18:15:35.017837
91	2	54	2510042301	2029-10-14	UND	SUAVINEX GROUP, S.L	15.00	25.00	648.00	\N	1.00	1.00	648.00	0.00	648.00	2026-05-21 18:15:35.017837
92	2	55	2510010701	2029-10-07	UND	SUAVINEX GROUP, S.L	15.00	25.00	2154.00	\N	1.00	1.00	2154.00	0.00	2154.00	2026-05-21 18:15:35.017837
93	2	55	2510003001	2029-10-07	UND	SUAVINEX GROUP, S.L	15.00	25.00	1356.00	\N	1.00	1.00	1356.00	0.00	1356.00	2026-05-21 18:15:35.017837
94	2	56	2510067901	2029-10-17	UND	SUAVINEX GROUP, S.L	15.00	25.00	1845.00	\N	1.00	1.00	1845.00	0.00	1845.00	2026-05-21 18:15:35.017837
95	2	55	2509095101	2029-09-26	UND	SUAVINEX GROUP, S.L	15.00	25.00	90.00	\N	1.00	1.00	90.00	0.00	90.00	2026-05-21 18:15:35.017837
96	2	57	2509030901	2029-09-08	UND	SUAVINEX GROUP, S.L	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-21 18:15:35.017837
97	2	57	2510041201	\N	UND	SUAVINEX GROUP, S.L	15.00	25.00	78.00	\N	1.00	1.00	78.00	0.00	78.00	2026-05-21 18:15:35.017837
98	2	58	2511014801	\N	UND	SUAVINEX GROUP, S.L	15.00	25.00	594.00	\N	1.00	1.00	594.00	0.00	594.00	2026-05-21 18:15:35.017837
99	2	59	2511015301	2029-11-07	UND	SUAVINEX GROUP, S.L	15.00	25.00	1248.00	\N	1.00	1.00	1248.00	0.00	1248.00	2026-05-21 18:15:35.017837
100	2	60	241189400	\N	UND	SUAVINEX GROUP, S.L	15.00	25.00	72.00	\N	1.00	1.00	72.00	0.00	72.00	2026-05-21 18:15:35.017837
101	2	61	2512003601	2029-12-09	UND	SUAVINEX GROUP, S.L	15.00	25.00	2268.00	\N	1.00	1.00	2268.00	0.00	2268.00	2026-05-21 18:15:35.017837
102	2	59	2512012101	2029-12-10	UND	SUAVINEX GROUP, S.L	15.00	25.00	1344.00	\N	1.00	1.00	1344.00	0.00	1344.00	2026-05-21 18:15:35.017837
103	2	62	2403049101	2028-03-14	UND	SUAVINEX GROUP, S.L	15.00	25.00	64.00	\N	1.00	1.00	64.00	0.00	64.00	2026-05-21 18:15:35.017837
104	2	62	2308074801	2028-03-14	UND	SUAVINEX GROUP, S.L	15.00	25.00	32.00	\N	1.00	1.00	32.00	0.00	32.00	2026-05-21 18:15:35.017837
105	2	63	2509098301	2029-10-02	UND	SUAVINEX GROUP, S.L	15.00	25.00	162.00	\N	1.00	1.00	162.00	0.00	162.00	2026-05-21 18:15:35.017837
106	2	64	2510071701	2029-10-22	UND	SUAVINEX GROUP, S.L	15.00	25.00	162.00	\N	1.00	1.00	162.00	0.00	162.00	2026-05-21 18:15:35.017837
107	2	65	2509047201	2029-09-17	UND	SUAVINEX GROUP, S.L	15.00	25.00	162.00	\N	1.00	1.00	162.00	0.00	162.00	2026-05-21 18:15:35.017837
108	2	66	2510098701	2029-10-24	UND	SUAVINEX GROUP, S.L	15.00	25.00	162.00	\N	1.00	1.00	162.00	0.00	162.00	2026-05-21 18:15:35.017837
109	2	67	2509092101	2029-09-26	UND	SUAVINEX GROUP, S.L	15.00	25.00	78.00	\N	1.00	1.00	78.00	0.00	78.00	2026-05-21 18:15:35.017837
110	2	68	2509111101	2029-10-01	UND	SUAVINEX GROUP, S.L	15.00	25.00	156.00	\N	1.00	1.00	156.00	0.00	156.00	2026-05-21 18:15:35.017837
111	2	69	2509109401	2029-09-29	UND	SUAVINEX GROUP, S.L	15.00	25.00	78.00	\N	1.00	1.00	78.00	0.00	78.00	2026-05-21 18:15:35.017837
112	2	70	25101143	2028-10-01	UND	SUAVINEX GROUP, S.L	15.00	25.00	660.00	\N	1.00	1.00	660.00	0.00	660.00	2026-05-21 18:15:35.017837
113	2	71	2402052101	2028-02-20	UND	SUAVINEX GROUP, S.L	15.00	25.00	144.00	\N	1.00	1.00	144.00	0.00	144.00	2026-05-21 18:15:35.017837
114	2	72	2507002501	2029-07-02	UND	SUAVINEX GROUP, S.L	15.00	25.00	78.00	\N	1.00	1.00	78.00	0.00	78.00	2026-05-21 18:15:35.017837
115	2	73	2511048601	2029-11-17	UND	SUAVINEX GROUP, S.L	15.00	25.00	87.00	\N	1.00	1.00	87.00	0.00	87.00	2026-05-21 18:15:35.017837
116	2	73	2507028801	2029-07-10	UND	SUAVINEX GROUP, S.L	15.00	25.00	69.00	\N	1.00	1.00	69.00	0.00	69.00	2026-05-21 18:15:35.017837
117	2	74	2507076601	2029-08-26	UND	SUAVINEX GROUP, S.L	15.00	25.00	78.00	\N	1.00	1.00	78.00	0.00	78.00	2026-05-21 18:15:35.017837
118	2	75	2510049801	2029-10-15	UND	SUAVINEX GROUP, S.L	15.00	25.00	30.00	\N	1.00	1.00	30.00	0.00	30.00	2026-05-21 18:15:35.017837
119	2	75	2510075001	2029-10-21	UND	SUAVINEX GROUP, S.L	15.00	25.00	318.00	\N	1.00	1.00	318.00	0.00	318.00	2026-05-21 18:15:35.017837
120	2	76	2506268201	2029-07-03	UND	SUAVINEX GROUP, S.L	15.00	25.00	64.00	\N	1.00	1.00	64.00	0.00	64.00	2026-05-21 18:15:35.017837
121	2	77	2511022701	2029-11-12	UND	SUAVINEX GROUP, S.L	15.00	25.00	420.00	\N	1.00	1.00	420.00	0.00	420.00	2026-05-21 18:15:35.017837
122	2	78	25110097	2028-11-17	UND	SUAVINEX GROUP, S.L	15.00	25.00	576.00	\N	1.00	1.00	576.00	0.00	576.00	2026-05-21 18:15:35.017837
123	2	59	2511090601	2029-11-21	UND	SUAVINEX GROUP, S.L	15.00	25.00	1296.00	\N	1.00	1.00	1296.00	0.00	1296.00	2026-05-21 18:15:35.017837
124	2	61	2510042801	2029-10-13	UND	SUAVINEX GROUP, S.L	15.00	25.00	594.00	\N	1.00	1.00	594.00	0.00	594.00	2026-05-21 18:15:35.017837
125	2	61	2510115601	2029-11-05	UND	SUAVINEX GROUP, S.L	15.00	25.00	642.00	\N	1.00	1.00	642.00	0.00	642.00	2026-05-21 18:15:35.017837
126	2	61	2510042801	2029-10-13	UND	SUAVINEX GROUP, S.L	15.00	25.00	42.00	\N	1.00	1.00	42.00	0.00	42.00	2026-05-21 18:15:35.017837
127	2	79	2411062100	\N	UND	SUAVINEX GROUP, S.L	15.00	25.00	72.00	\N	1.00	1.00	72.00	0.00	72.00	2026-05-21 18:15:35.017837
128	2	80	2505032900	\N	UND	SUAVINEX GROUP, S.L	15.00	25.00	72.00	\N	1.00	1.00	72.00	0.00	72.00	2026-05-21 18:15:35.017837
129	2	81	2506030700	\N	UND	SUAVINEX GROUP, S.L	15.00	25.00	1944.00	\N	1.00	1.00	1944.00	0.00	1944.00	2026-05-21 18:15:35.017837
130	2	81	2505004800	\N	UND	SUAVINEX GROUP, S.L	15.00	25.00	2988.00	\N	1.00	1.00	2988.00	0.00	2988.00	2026-05-21 18:15:35.017837
131	2	82	2511086701	2029-11-27	UND	SUAVINEX GROUP, S.L	15.00	25.00	1860.00	\N	1.00	1.00	1860.00	0.00	1860.00	2026-05-21 18:15:35.017837
132	2	83	2503052801	2029-03-27	UND	SUAVINEX GROUP, S.L	15.00	25.00	114.00	\N	1.00	1.00	114.00	0.00	114.00	2026-05-21 18:15:35.017837
133	2	84	2506049601	2029-06-13	UND	SUAVINEX GROUP, S.L	15.00	25.00	124.00	\N	1.00	1.00	124.00	0.00	124.00	2026-05-21 18:15:35.017837
134	2	85	2510075401	2029-10-20	UND	SUAVINEX GROUP, S.L	15.00	25.00	126.00	\N	1.00	1.00	126.00	0.00	126.00	2026-05-21 18:15:35.017837
135	2	86	2510075501	\N	UND	SUAVINEX GROUP, S.L	15.00	25.00	189.00	\N	1.00	1.00	189.00	0.00	189.00	2026-05-21 18:15:35.017837
136	2	87	2511023301	\N	UND	SUAVINEX GROUP, S.L	15.00	25.00	126.00	\N	1.00	1.00	126.00	0.00	126.00	2026-05-21 18:15:35.017837
137	2	76	2506268201	2029-07-03	UND	SUAVINEX GROUP, S.L	15.00	25.00	320.00	\N	1.00	1.00	320.00	0.00	320.00	2026-05-21 18:15:35.017837
138	2	76	2504068001	2029-05-08	UND	SUAVINEX GROUP, S.L	15.00	25.00	224.00	\N	1.00	1.00	224.00	0.00	224.00	2026-05-21 18:15:35.017837
139	2	88	2511053301	2029-11-17	UND	SUAVINEX GROUP, S.L	15.00	25.00	960.00	\N	1.00	1.00	960.00	0.00	960.00	2026-05-21 18:15:35.017837
140	2	77	2511022701	2029-11-12	UND	SUAVINEX GROUP, S.L	15.00	25.00	240.00	\N	1.00	1.00	240.00	0.00	240.00	2026-05-21 18:15:35.017837
141	2	84	2506049601	2029-06-13	UND	SUAVINEX GROUP, S.L	15.00	25.00	272.00	\N	1.00	1.00	272.00	0.00	272.00	2026-05-21 18:15:35.017837
147	4	91	20240620	2029-06-19	UND	ALCIMAR´S MEDIC	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-22 17:04:10.870925
148	4	92	HE0325AM	2030-02-28	UND	ALCIMAR´S MEDIC	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-22 17:04:10.870925
149	4	93	IN25008662	2030-07-01	UND	ALCIMAR´S MEDIC	15.00	25.00	30.00	\N	1.00	1.00	30.00	0.00	30.00	2026-05-22 17:04:10.870925
150	4	94	212164	2030-02-28	UND	ALCIMAR´S MEDIC	15.00	25.00	30.00	\N	1.00	1.00	30.00	0.00	30.00	2026-05-22 17:04:10.870925
151	4	95	20250418	2030-04-17	UND	ALCIMAR´S MEDIC	15.00	25.00	31.00	\N	1.00	1.00	31.00	0.00	31.00	2026-05-22 17:04:10.870925
152	4	96	210015	2030-10-31	UND	ALCIMAR´S MEDIC	15.00	25.00	50.00	\N	1.00	1.00	50.00	0.00	50.00	2026-05-22 17:04:10.870925
153	4	97	G253	\N	UND	EDVAMEDICAL E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-22 17:04:10.870925
154	4	98	IN1240527	2027-03-27	UND	PFH LAB MEDIC E.I.R.L.	15.00	25.00	70.00	\N	1.00	1.00	70.00	0.00	70.00	2026-05-22 17:04:10.870925
155	4	99	IN250523	2027-12-23	UND	PFH LAB MEDIC E.I.R.L.	15.00	25.00	70.00	\N	1.00	1.00	70.00	0.00	70.00	2026-05-22 17:04:10.870925
156	4	100	303919	2027-04-19	UND	CORPORACION LYACOS E.I.R.L	15.00	25.00	53.00	\N	1.00	1.00	53.00	0.00	53.00	2026-05-22 17:04:10.870925
158	4	102	360124-M24912370023	\N	UND	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-22 17:04:10.870925
159	4	102	360124-M25410060001	\N	UND	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-22 17:04:10.870925
160	4	103	361527- M25C10210005	\N	UND	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-22 17:04:10.870925
161	4	104	AAVLK09EX	2027-08-02	UND	RAPIDIAGNOSTICS S.A.C.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-22 17:04:10.870925
162	4	105	MAVFH04EX	2027-02-10	UND	RAPIDIAGNOSTICS S.A.C.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-22 17:04:10.870925
163	4	106	360080-M25520140001	\N	UND	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-22 17:04:10.870925
165	4	107	2025081551	2027-08-14	UND	ANDINA MEDICA FILIAL PERU	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-22 17:04:10.870925
166	4	108	2025081451	2027-08-13	UND	ANDINA MEDICA FILIAL PERU	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-05-22 17:04:10.870925
168	5	109	20260225J1	2028-02-24	UND	Xi'an Tianguangyuan Biotech Co.,Ltd.	15.00	25.00	500.00	\N	1.00	1.00	500.00	0.00	500.00	2026-05-22 19:39:58.723865
169	6	325	SN-560435M25308290001	\N	UND	EDAN INSTRUMENTS INC	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-22 20:37:59.194105
170	7	326	2040355	2028-04-30	UND	COBEFAR S.A.C.	15.00	25.00	500.00	\N	1.00	1.00	500.00	0.00	500.00	2026-05-22 21:14:37.008465
171	8	327	2103144	2027-10-31	UND	COBEFAR S.A.C.	15.00	25.00	1000.00	\N	1.00	1.00	1000.00	0.00	1000.00	2026-05-22 21:19:09.526797
157	4	101	202507V	2030-07-31	UND	FERVAL BABY SAC	15.00	25.00	50.00	\N	1.00	1.00	50.00	0.00	50.00	2026-05-22 17:04:10.870925
164	4	101	202507V	2030-07-31	UND	FERVAL BABY SAC	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-05-22 17:04:10.870925
167	4	101	202507V	2030-07-31	UND	FERVAL BABY SAC	15.00	25.00	40.00	\N	1.00	1.00	40.00	0.00	40.00	2026-05-22 17:04:10.870925
172	9	110	SM0612-062301	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
173	9	111	SM0612-062302	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
174	9	112	SM0612-062303	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
175	9	113	SM0612-062304	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	36.00	\N	1.00	1.00	36.00	0.00	36.00	2026-05-26 00:23:00.590089
176	9	114	SM0612-062305	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
177	9	115	SM0612-062306	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
178	9	116	SM0612-062307	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
179	9	117	SM0612-062308	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
180	9	118	SM0612-062309	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
181	9	119	SM0612-062310	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-05-26 00:23:00.590089
182	9	120	SM0612-062311	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-05-26 00:23:00.590089
183	9	121	SM0612-062312	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	30.00	\N	1.00	1.00	30.00	0.00	30.00	2026-05-26 00:23:00.590089
184	9	122	SM0612-062313	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	36.00	\N	1.00	1.00	36.00	0.00	36.00	2026-05-26 00:23:00.590089
185	9	123	SM0612-062314	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	30.00	\N	1.00	1.00	30.00	0.00	30.00	2026-05-26 00:23:00.590089
186	9	124	SM0612-062315	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
187	9	125	SM0612-062316	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
188	9	126	SM0612-062317	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
189	9	127	SM0612-062318	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
190	9	128	SM0612-062319	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
191	9	129	SM0612-062320	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
192	9	130	SM0612-062321	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
193	9	131	SM0612-062322	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
194	9	132	SM0612-062323	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
195	9	133	SM0612-062324	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
196	9	134	SM0612-062325	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
197	9	135	SM0612-062326	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
198	9	136	SM0612-062327	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
199	9	137	SM0612-062328	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
200	9	138	SM0612-062329	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
201	9	139	SM0612-062330	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
202	9	140	SM0612-062331	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
203	9	141	SM0612-062332	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
204	9	142	SM0612-062333	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
205	9	143	SM0612-062334	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
206	9	144	SM0612-062335	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
207	9	145	SM0612-062336	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
208	9	146	SM0612-062337	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
209	9	147	SM0612-062338	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-26 00:23:00.590089
210	9	148	SM0612-062339	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
211	9	149	SM0612-062340	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
212	9	150	SM0612-062341	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
213	9	151	SM0612-062342	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
214	9	152	SM0612-062344	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
215	9	153	SM0612-062345	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	19.00	\N	1.00	1.00	19.00	0.00	19.00	2026-05-26 00:23:00.590089
216	9	154	SM0612-062346	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
217	9	155	SM0612-062347	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
218	9	156	SM0612-062348	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
219	9	157	SM0612-062349	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	31.00	\N	1.00	1.00	31.00	0.00	31.00	2026-05-26 00:23:00.590089
220	9	158	SM0612-062350	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
221	9	159	SM0612-062351	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
222	9	160	SM0612-062352	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
223	9	161	SM0612-062201	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
224	9	162	SM0612-062202	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
225	9	163	SM0612-062203	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
226	9	164	SM0612-062204	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
227	9	165	SM0612-062205	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
228	9	166	SM0612-062206	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	30.00	\N	1.00	1.00	30.00	0.00	30.00	2026-05-26 00:23:00.590089
229	9	167	SM0612-062207	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
230	9	168	SM0612-062208	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
231	9	169	SM0612-062209	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
232	9	170	SM0612-062210	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
233	9	171	SM0612-062211	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-05-26 00:23:00.590089
234	9	172	SM0612-062212	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
235	9	173	SM0612-062213	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
236	9	174	SM0612-062214	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
237	9	175	SM0612-062215	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
238	9	176	SM0612-062216	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
239	9	177	SM0612-062217	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
240	9	178	SM0612-062218	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	42.00	\N	1.00	1.00	42.00	0.00	42.00	2026-05-26 00:23:00.590089
241	9	179	SM0612-062219	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	42.00	\N	1.00	1.00	42.00	0.00	42.00	2026-05-26 00:23:00.590089
242	9	180	SM0612-062220	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	42.00	\N	1.00	1.00	42.00	0.00	42.00	2026-05-26 00:23:00.590089
243	9	181	SM0612-062221	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	42.00	\N	1.00	1.00	42.00	0.00	42.00	2026-05-26 00:23:00.590089
244	9	182	SM0612-062222	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	42.00	\N	1.00	1.00	42.00	0.00	42.00	2026-05-26 00:23:00.590089
245	9	183	SM0612-062223	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	42.00	\N	1.00	1.00	42.00	0.00	42.00	2026-05-26 00:23:00.590089
246	9	184	SM0612-062224	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	42.00	\N	1.00	1.00	42.00	0.00	42.00	2026-05-26 00:23:00.590089
247	9	185	SM0612-062225	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	42.00	\N	1.00	1.00	42.00	0.00	42.00	2026-05-26 00:23:00.590089
248	9	186	SM0612-062226	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
249	9	187	SM0612-062227	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
250	9	188	SM0612-062228	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
251	9	189	SM0612-062229	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
252	9	190	SM0612-062001	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
253	9	191	SM0612-062002	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
254	9	192	SM0612-062003	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
255	9	193	SM0612-062004	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
256	9	194	SM0612-062005	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
257	9	195	SM0612-062006	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
258	9	196	SM0612-062007	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
259	9	197	SM0612-062008	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
260	9	198	SM0612-062009	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
261	9	199	SM0612-062010	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
262	9	200	SM0612-062011	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
263	9	201	SM0612-062012	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
264	9	202	SM0612-062013	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
265	9	203	SM0612-062014	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
266	9	204	SM0612-062015	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
267	9	205	SM0612-062016	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
268	9	206	SM0612-062017	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
269	9	207	SM0612-062018	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
270	9	208	SM0612-062019	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
271	9	209	SM0612-062020	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
272	9	210	SM0612-062021	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
273	9	211	SM0612-062022	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
274	9	212	SM0612-062023	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-05-26 00:23:00.590089
275	9	213	SM0612-062024	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
276	9	214	SM0612-062025	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
277	9	215	SM0612-062026	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
278	9	216	SM0612-062027	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
279	9	217	SM0612-062028	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
280	9	218	SM0612-062029	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
281	9	219	SM0612-062030	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
282	9	220	SM0612-062031	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
283	9	221	SM0612-062032	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
284	9	222	SM0612-062033	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
285	9	223	SM0612-062034	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
286	9	224	SM0612-062035	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
287	9	225	SM0612-062036	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
288	9	226	SM0612-062037	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
289	9	227	SM0612-062038	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	48.00	\N	1.00	1.00	48.00	0.00	48.00	2026-05-26 00:23:00.590089
290	9	228	SM0612-062039	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
291	9	229	SM0612-062040	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
292	9	230	SM0612-062041	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-05-26 00:23:00.590089
293	9	231	SM0612-062042	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	30.00	\N	1.00	1.00	30.00	0.00	30.00	2026-05-26 00:23:00.590089
294	9	232	SM0612-062043	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	30.00	\N	1.00	1.00	30.00	0.00	30.00	2026-05-26 00:23:00.590089
295	9	233	SM0612-062044	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
296	9	234	SM0612-062045	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
297	9	235	SM0612-062046	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
298	9	236	SM0612-062047	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	11.00	\N	1.00	1.00	11.00	0.00	11.00	2026-05-26 00:23:00.590089
299	9	237	SM0612-062048	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	13.00	\N	1.00	1.00	13.00	0.00	13.00	2026-05-26 00:23:00.590089
300	9	238	SM0612-062049	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
301	9	239	SM0612-062051	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
302	9	240	SM0612-062052	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
303	9	241	SM0612-062053	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
304	9	242	SM0612-062054	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
305	9	243	SM0612-062055	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
306	9	244	SM0612-062056	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
307	9	245	SM0612-062057	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
308	9	246	SM0612-062058	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-05-26 00:23:00.590089
309	9	247	SM0612-062059	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
310	9	248	SM0612-062060	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
311	9	249	SM0612-062067	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
312	9	250	SM0612-062061	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
313	9	251	SM0612-062062	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
314	9	252	SM0612-062063	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
315	9	253	SM0612-062064	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
316	9	254	SM0612-062065	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
317	9	255	SM0612-062066	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-26 00:23:00.590089
318	9	256	SM0612-062101	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
319	9	257	SM0612-062102	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
320	9	258	SM0612-062103	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
321	9	259	SM0612-062104	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
322	9	260	SM0612-062105	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
323	9	261	SM0612-062106	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	13.00	\N	1.00	1.00	13.00	0.00	13.00	2026-05-26 00:23:00.590089
324	9	262	SM0612-062107	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
325	9	263	SM0612-062108	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-26 00:23:00.590089
326	9	264	SM0612-062109	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-05-26 00:23:00.590089
327	9	328	SM0612-062110	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
328	9	329	SM0612-062111	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	42.00	\N	1.00	1.00	42.00	0.00	42.00	2026-05-26 00:23:00.590089
329	9	330	SM0612-062112	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
330	9	331	SM0612-062113	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
331	9	332	SM0612-062114	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
332	9	333	SM0612-062115	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
333	9	334	SM0612-062116	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
334	9	335	SM0612-062117	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
335	9	336	SM0612-062118	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
336	9	337	SM0612-062119	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
337	9	338	SM0612-062120	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
338	9	339	SM0612-062121	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	132.00	\N	1.00	1.00	132.00	0.00	132.00	2026-05-26 00:23:00.590089
339	9	340	SM0612-062122	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
340	9	341	SM0612-062123	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
341	9	342	SM0612-062124	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
342	9	343	SM0612-062125	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
343	9	344	SM0612-062126	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
344	9	345	SM0612-062127	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
345	9	346	SM0612-062128	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
346	9	347	SM0612-062129	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
347	9	348	SM0612-062130	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	18.00	\N	1.00	1.00	18.00	0.00	18.00	2026-05-26 00:23:00.590089
348	9	349	SM0612-062131	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
349	9	350	SM0612-062132	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
350	9	351	SM0612-062133	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
351	9	352	SM0612-062134	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
352	9	353	SM0612-062135	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
353	9	354	SM0612-062136	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	48.00	\N	1.00	1.00	48.00	0.00	48.00	2026-05-26 00:23:00.590089
354	9	265	SM0612-062401	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
355	9	266	SM0612-062402	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
356	9	267	SM0612-062403	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
357	9	268	SM0612-062404	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
358	9	269	SM0612-062405	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
359	9	270	SM0612-062406	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
360	9	271	SM0612-062407	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
361	9	272	SM0612-062408	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
362	9	273	SM0612-062409	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
363	9	274	SM0612-062410	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
364	9	275	SM0612-062411	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
365	9	276	SM0612-062412	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
366	9	277	SM0612-062413	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
367	9	278	SM0612-062414	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
368	9	279	SM0612-062415	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
369	9	280	SM0612-062416	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
370	9	281	SM0612-062417	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
371	9	282	SM0612-062418	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
372	9	283	SM0612-062419	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
373	9	284	SM0612-062420	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
374	9	285	SM0612-062421	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
375	9	286	SM0612-062422	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
376	9	287	SM0612-062423	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
377	9	288	SM0612-062424	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
378	9	289	SM0612-062425	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
379	9	290	SM0612-062426	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
380	9	291	SM0612-062427	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
381	9	292	SM0612-062428	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
382	9	293	SM0612-062429	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
383	9	294	SM0612-062430	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
384	9	295	SM0612-062431	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
385	9	296	SM0612-062432	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
386	9	297	SM0612-062433	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
387	9	298	SM0612-062434	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
388	9	299	SM0612-062435	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
389	9	300	SM0612-062436	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
390	9	301	SM0612-062438	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
391	9	302	SM0612-062439	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
392	9	303	SM0612-062440	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
393	9	304	SM0612-062441	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	36.00	\N	1.00	1.00	36.00	0.00	36.00	2026-05-26 00:23:00.590089
394	9	305	SM0612-062442	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	24.00	\N	1.00	1.00	24.00	0.00	24.00	2026-05-26 00:23:00.590089
395	9	306	SM0612-062443	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	50.00	\N	1.00	1.00	50.00	0.00	50.00	2026-05-26 00:23:00.590089
396	9	307	SM0612-062444	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	50.00	\N	1.00	1.00	50.00	0.00	50.00	2026-05-26 00:23:00.590089
397	9	308	SM0612-062445	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	50.00	\N	1.00	1.00	50.00	0.00	50.00	2026-05-26 00:23:00.590089
398	9	309	SM0612-062446	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
399	9	310	SM0612-062447	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
400	9	311	SM0612-062448	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
401	9	312	SM0612-062449	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
402	9	313	SM0612-062450	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
403	9	314	SM0612-062451	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
404	9	315	SM0612-062452	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
405	9	316	SM0612-062453	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
406	9	317	SM0612-062454	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-05-26 00:23:00.590089
407	9	318	SM0612-062455	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
408	9	319	SM0612-062456	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-05-26 00:23:00.590089
409	9	320	SM0612-062457	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-26 00:23:00.590089
410	9	321	SM0612-062461	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-26 00:23:00.590089
411	9	322	SM0612-062458	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-26 00:23:00.590089
412	9	323	SM0612-062459	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-26 00:23:00.590089
413	9	324	SM0612-062460	\N	UND	SUNMED INSTRUMENTS	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-05-26 00:23:00.590089
414	10	9	SP1125121506	2028-12-23	UND	JOSSON MEDICAL EIRL	15.00	25.00	20.00	\N	1.00	1.00	20.00	0.00	20.00	2026-05-27 20:44:48.616357
415	10	5	SP5324121808	2027-12-18	UND	JOSSON MEDICAL EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-27 20:44:48.616357
416	10	45	2511114218	2028-11-10	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-27 20:44:48.616357
417	10	46	2506106166	2028-06-09	UND	JOSSON MEDICAL EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-05-27 20:44:48.616357
418	10	4	SP5325022829	2028-03-02	UND	JOSSON MEDICAL EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-27 20:44:48.616357
419	10	4	SP5325082210	2028-08-23	UND	JOSSON MEDICAL EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-05-27 20:44:48.616357
1374	21	757	13500000002507024820	\N	UND	TARRILLO BARBA S.A.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 15:28:56.24014
1375	21	758	13500000002507024821	\N	UND	TARRILLO BARBA S.A.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 15:28:56.24014
1376	21	759	13500000002507024822	\N	UND	TARRILLO BARBA S.A.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 15:28:56.24014
1377	21	760	13500000002507024823	\N	UND	TARRILLO BARBA S.A.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 15:28:56.24014
1378	21	761	13500000002507024824	\N	UND	TARRILLO BARBA S.A.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 15:28:56.24014
1379	21	762	13500000002507024825	\N	UND	TARRILLO BARBA S.A.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 15:28:56.24014
1380	21	763	13500000002507024826	\N	UND	TARRILLO BARBA S.A.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 15:28:56.24014
1381	21	764	13500000002507024827	\N	UND	TARRILLO BARBA S.A.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 15:28:56.24014
1427	38	801	251210	2027-11-01	UND	GRUPO PALMISTA S.A.C.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-11 20:13:30.581808
2216	39	700	2604227464	2029-04-21	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	500.00	\N	1.00	1.00	500.00	0.00	500.00	2026-06-17 21:48:43.619236
2217	39	843	20260109R	2028-12-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2218	39	713	202604635	2029-04-27	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	200.00	\N	1.00	1.00	200.00	0.00	200.00	2026-06-17 21:48:43.619236
2219	39	717	202604636	2029-04-27	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	500.00	\N	1.00	1.00	500.00	0.00	500.00	2026-06-17 21:48:43.619236
2220	39	622	MVC41	2028-02-18	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2221	39	620	MVC44	2028-03-09	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2222	39	696	MVC45	2028-03-09	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2223	39	619	MVC45	2028-03-09	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2224	39	621	MVC46	2028-03-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2225	39	621	MVC49	2028-04-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2226	39	620	MVC51	2028-04-13	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2227	39	628	PMTDF85	2028-01-09	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2228	39	844	PMTDF89	2028-02-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2229	39	627	PMTDF91	2028-02-22	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2230	39	698	PMTDF93	2028-02-29	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2231	39	626	PMTDF94	2028-03-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2232	39	698	PMTDF96	2028-03-29	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2233	39	633	PMTVD46	2028-12-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2234	39	636	PMTVD58	2029-02-20	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2235	39	635	PMTVD64	2029-03-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2236	39	634	PMTVD65	2029-03-10	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2237	39	636	PMTVD74	2029-04-13	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2238	39	631	PPHTD16	2028-03-11	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2239	39	631	PPHTD25	2028-04-07	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2240	39	632	PVLDCK69	2029-01-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2241	39	632	PVLDCK70	2029-01-19	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2242	39	632	PVLDCK74	2029-01-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	11.00	\N	1.00	1.00	11.00	0.00	11.00	2026-06-17 21:48:43.619236
2243	39	845	250910	2028-02-29	UND	CARDIOMED S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2244	39	700	2510227462	2028-10-21	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
2245	39	592	EFG94	2028-06-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2246	39	586	EFG99	2028-06-21	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2247	39	587	EFH05	2028-06-26	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2248	39	588	EFH06	2028-06-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2249	39	590	EFH06	2028-06-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2250	39	589	EFH07	2028-06-28	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2251	39	595	EFH10	2028-06-30	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2252	39	585	EFH14	2028-07-05	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2253	39	591	EFH17	2028-07-10	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2254	39	710	EFH18	2028-07-10	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2255	39	593	EFH23	2028-07-24	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2256	39	612	EFH26	2028-07-25	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2257	39	596	EFH39	2028-09-26	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2258	39	603	EFH40	2028-09-25	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2259	39	615	EFH41	2028-09-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2260	39	597	EFH43	2028-09-30	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2261	39	598	EFH43	2028-09-30	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2262	39	709	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1382	22	765	560038-M25910830007	\N	UND	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 16:43:16.751961
1428	35	795	775080	\N	UND	A. TARRILLO SA.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-11 21:39:11.381521
1429	35	796	0000072163	2028-05-02	UND	A. TARRILLO SA.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-11 21:39:11.381521
2263	39	601	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2264	39	604	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2265	39	594	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2266	39	609	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2267	39	610	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2268	39	606	EFH47	2028-10-04	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2269	39	616	EFH48	2028-10-04	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2270	39	602	EFH50	2028-10-13	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2271	39	712	EFH51	2028-10-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2272	39	617	EFH56	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2273	39	711	EFH56	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2274	39	599	EFH59	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2275	39	600	EFH59	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2276	39	605	EFH60	2028-11-15	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2277	39	613	EFH62	2028-11-17	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2278	39	608	EFH63	2028-11-17	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2279	39	611	EFH63	2028-11-17	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2280	39	614	EFH64	2028-11-18	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2281	39	840	2405-0167	2027-04-30	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2282	39	846	SL241428	2027-02-28	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2283	39	840	2405-0167	2027-04-30	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2284	39	846	SL241428	2027-02-28	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2285	39	703	2510227459	2028-10-22	UND	CARDIO PERFUSION EIRL	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2286	39	700	2510227462	2028-10-21	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2287	39	659	S25TZALJAC	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2288	39	681	S25TZAQOAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2289	39	660	S25TZARNAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2290	39	684	S25TZATHAD	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2297	39	753	2510227457	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2298	39	754	2510227461	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2299	39	802	2510227467	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2300	39	804	2510227469	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2301	39	805	2510227470	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2302	39	806	2510227471	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2303	39	809	2510227474	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2304	39	812	2510227477	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2305	39	813	2510227478	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2306	39	817	2510227482	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2307	39	818	2510227483	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2308	39	821	2510227486	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2309	39	822	2510227487	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2310	39	823	2510227488	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2311	39	824	2510227489	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2312	39	825	2510227490	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2313	39	826	2510227491	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2314	39	828	2510227493	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2315	39	829	2510227494	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2316	39	830	2510227495	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1383	23	104	AAWAN11EX	2027-09-21	UND	RAPIDIAGNOSTICS S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-10 16:52:13.68057
1384	23	105	MAVLX03EX	2027-08-17	UND	RAPIDIAGNOSTICS S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-10 16:52:13.68057
1385	23	766	DFRVCA11	2026-11-09	UND	RAPIDIAGNOSTICS S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 16:52:13.68057
1430	39	590	EFG78	2028-05-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1431	39	592	EFG82	2028-05-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1432	39	588	EFG94	2028-06-14	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1433	39	593	EFG95	2028-06-26	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1434	39	586	EFG99	2028-06-21	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	11.00	\N	1.00	1.00	11.00	0.00	11.00	2026-06-17 21:48:43.619236
1435	39	588	EFG99	2028-06-21	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1436	39	587	EFH05	2028-06-26	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	11.00	\N	1.00	1.00	11.00	0.00	11.00	2026-06-17 21:48:43.619236
1437	39	589	EFH07	2028-06-28	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1438	39	591	EFH07	2028-06-28	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1439	39	595	EFH07	2028-06-28	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1440	39	598	EFH09	2028-07-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1441	39	594	EFH10	2028-06-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1442	39	597	EFH10	2028-06-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1443	39	596	EFH13	2028-07-02	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1444	39	606	EFH13	2028-07-02	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1445	39	585	EFH14	2028-07-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	11.00	\N	1.00	1.00	11.00	0.00	11.00	2026-06-17 21:48:43.619236
1446	39	612	EFH17	2028-07-10	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1447	39	604	EFH18	2028-07-10	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-06-17 21:48:43.619236
1448	39	605	EFH19	2028-07-11	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-06-17 21:48:43.619236
1449	39	597	EFH20	2028-07-11	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1450	39	616	EFH23	2028-07-24	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1451	39	617	EFH23	2028-07-24	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1452	39	601	EFH24	2028-07-23	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1453	39	602	EFH24	2028-07-23	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1454	39	610	EFH25	2028-07-24	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1455	39	611	EFH26	2028-07-25	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1456	39	615	EFH29	2028-08-07	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1457	39	600	EFH30	2028-08-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1458	39	614	EFH31	2028-08-07	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1459	39	599	EFH32	2028-08-08	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	16.00	\N	1.00	1.00	16.00	0.00	16.00	2026-06-17 21:48:43.619236
1460	39	607	EFH32	2028-08-08	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1461	39	603	EFH33	2028-08-11	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-06-17 21:48:43.619236
1462	39	613	EFH33	2028-08-11	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1463	39	609	EFH34	2028-08-11	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1464	39	608	EFH35	2028-09-04	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1465	39	623	MVC08	2027-09-03	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1466	39	622	MVC10	2027-09-15	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1467	39	620	MVC11	2027-09-16	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1468	39	624	MVC11	2027-09-16	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1469	39	618	MVC12	2027-09-22	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1470	39	619	MVC13	2027-09-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1471	39	621	MVC14	2027-09-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1472	39	629	PMTDF53	2027-07-11	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1473	39	628	PMTDF57	2027-07-31	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1474	39	630	PMTDF59	2027-08-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1475	39	625	PMTDF63	2027-08-25	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1476	39	626	PMTDF64	2027-09-07	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1477	39	627	PMTDF64	2027-09-07	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1478	39	635	PMTVD11	2028-06-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1479	39	633	PMTVD14	2028-07-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1480	39	634	PMTVD20	2028-07-20	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1481	39	636	PMTVD22	2028-07-29	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1482	39	631	PPHTC61	2027-09-20	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	14.00	\N	1.00	1.00	14.00	0.00	14.00	2026-06-17 21:48:43.619236
1483	39	632	PVLDCK13	2028-08-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1484	39	632	PVLDCK14	2028-08-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1386	24	767	F1010W1E00D	2027-10-14	UND	CIA. IMPORTADORA AMERICANA S.A.	15.00	25.00	20.00	\N	1.00	1.00	20.00	0.00	20.00	2026-06-10 17:59:42.257729
1485	39	638	POBC02	2026-06-16	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-06-17 21:48:43.619236
1486	39	637	POBC13	2026-07-18	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	35.00	\N	1.00	1.00	35.00	0.00	35.00	2026-06-17 21:48:43.619236
1487	39	661	P25TZAECAG	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1488	39	662	P25TZAFLAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1489	39	640	S25TZAHPAH	2027-03-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1490	39	640	S25TZAHUAC	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1491	39	646	S25TZAHXAC	2027-03-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1492	39	682	S25TZAJPAB	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1493	39	663	S25TZAKJAA	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1494	39	668	S25TZAKNAB	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1495	39	642	S25TZALOAJ	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1496	39	667	S25TZALZAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1497	39	653	S25TZAMAAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1498	39	681	S25TZAMBAE	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1499	39	681	S25TZAMDAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1500	39	718	S25TZAMMAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1501	39	652	S25TZAMNAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1502	39	680	S25TZANFAD	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1503	39	645	S25TZANUAG	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1504	39	648	S25TZANZAD	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1505	39	639	S25TZAOJAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1506	39	641	S25TZAONAF	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1507	39	647	S25TZAPKAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1508	39	643	S25TZAQWAF	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1509	39	680	S25TZASCAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1510	39	684	S25TZASMAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1511	39	660	S25TZATHAD	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1512	39	717	202510601	2028-10-13	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	1000.00	\N	1.00	1.00	1000.00	0.00	1000.00	2026-06-17 21:48:43.619236
1513	39	686	5032071	2027-02-28	UND	CARDIO PERFUSION EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1514	39	705	H3201753	2028-04-26	UND	CARDIO PERFUSION EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1517	39	687	I3232620	2028-05-26	UND	CARDIO PERFUSION EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1520	39	690	2309-0228	2026-08-31	UND	PHS PERUVIAN HOSPITAL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1521	39	691	2309-0229	2026-08-31	UND	PHS PERUVIAN HOSPITAL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1522	39	689	2309-0232	2026-08-31	UND	PHS PERUVIAN HOSPITAL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1523	39	686	5080571	2027-07-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1524	39	692	20231007	2026-09-30	UND	NIPRO MEDICAL CORPORACION	15.00	25.00	20.00	\N	1.00	1.00	20.00	0.00	20.00	2026-06-17 21:48:43.619236
1525	39	733	H3283983	2028-08-08	UND	CARDIO PERFUSION EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1526	39	694	H3318717	2028-09-02	UND	CARDIO PERFUSION EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1527	39	700	2508073037	2028-08-06	UND	MIRET MEDICAL ASOCIADOS S.A.C. MIRET MED	15.00	25.00	20.00	\N	1.00	1.00	20.00	0.00	20.00	2026-06-17 21:48:43.619236
1528	39	692	20231007	2026-09-30	UND	NIPRO MEDICAL CORPORATION	15.00	25.00	21.00	\N	1.00	1.00	21.00	0.00	21.00	2026-06-17 21:48:43.619236
1529	39	692	20231007	2026-09-30	UND	NIPRO MEDICAL CORPORATION	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-06-17 21:48:43.619236
1530	39	704	I3192257	2028-04-08	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1531	39	656	P25TZAEZAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1532	39	685	P25TZAFIAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1533	39	662	P25TZAFLAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1534	39	648	P25TZAFWAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1535	39	669	P25TZAFXAD	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2368	40	847	FD254945	2028-07-31	UND	SEVEN PHARMA	15.00	25.00	120.00	\N	1.00	1.00	120.00	0.00	120.00	2026-06-18 15:47:25.787293
1387	25	768	G222	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 18:30:57.695335
1388	25	769	G185	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-10 18:30:57.695335
1389	25	770	G222	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-10 18:30:57.695335
1390	25	771	D231	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-10 18:30:57.695335
1391	25	772	H129	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-10 18:30:57.695335
1392	25	773	H121	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-10 18:30:57.695335
1393	25	774	F229	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 18:30:57.695335
1394	25	774	D129	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 18:30:57.695335
1536	39	655	P25TZAGBAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1537	39	661	P25TZAGDAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1538	39	645	P25TZAGGAD	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1539	39	670	P25TZAGRAF	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1540	39	643	P25TZAGYAD	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1541	39	680	P25TZAHLAA	2027-08-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1542	39	682	S25TZAJPAB	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1543	39	683	S25TZAJYAD	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1544	39	682	S25TZAKHAC	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1545	39	659	S25TZALJAC	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1546	39	685	S25TZALPAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1547	39	666	S25TZALWAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1548	39	644	S25TZAMAAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1549	39	646	S25TZAMXAD	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1550	39	649	S25TZAMZAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1551	39	665	S25TZANGAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1552	39	668	S25TZANGAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1553	39	683	S25TZANIAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1554	39	650	S25TZANRAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1555	39	657	S25TZAOAAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1556	39	672	S25TZAOCAC	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1557	39	671	S25TZAOIAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1558	39	676	S25TZAOLAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1559	39	658	S25TZAOOAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1560	39	653	S25TZAOZAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1561	39	651	S25TZAPAAC	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1562	39	678	S25TZAPGAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1563	39	679	S25TZAPGAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1564	39	681	S25TZAPJAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1565	39	647	S25TZAPKAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1566	39	652	S25TZAPKAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1567	39	667	S25TZAPPAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1568	39	664	S25TZAPTAD	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1569	39	654	S25TZAPYAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1570	39	681	S25TZAQOAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1571	39	681	S25TZAQSAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1572	39	675	S25TZARIAE	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1573	39	673	S25TZARJAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1574	39	660	S25TZARNAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1575	39	674	S25TZARPAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1576	39	680	S25TZARQAE	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1577	39	663	S25TZARYAB	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1578	39	642	S25TZASCAL	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1395	26	775	F0331X3F00D	2028-04-02	UND	CIA IMPORTADORA AMERICANA S.A.	15.00	25.00	20.00	\N	1.00	1.00	20.00	0.00	20.00	2026-06-10 20:14:49.390947
1579	39	640	S25TZASDAB	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1580	39	641	S25TZASDAJ	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1581	39	684	S25TZASMAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1582	39	684	S25TZATHAD	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1583	39	677	S25TZAUAAG	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1584	39	639	S25TZAUFAG	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1585	39	705	H3201753	2028-04-26	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1586	39	586	EFG99	2028-06-21	UND	MIREL LIFE SCIENCES	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1587	39	587	EFH05	2028-06-26	UND	MIREL LIFE SCIENCES	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1588	39	585	EFH14	2028-07-05	UND	MIREL LIFE SCIENCES	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1589	39	622	MVC14	2027-09-27	UND	MERIL LIFE SCIENCES	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1590	39	619	MVC16	2027-10-06	UND	MERIL LIFE SCIENCES	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1591	39	620	MVC17	2027-10-07	UND	MERIL LIFE SCIENCES	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1592	39	696	MVC18	2027-10-13	UND	MERIL LIFE SCIENCES	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1593	39	695	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1594	39	618	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1595	39	621	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1596	39	697	PMTDF50	2027-07-05	UND	MERIL LIFE SCIENCES	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1597	39	628	PMTDF57	2027-07-31	UND	MERIL LIFE SCIENCES	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1598	39	629	PMTDF61	2027-08-20	UND	MERIL LIFE SCIENCES	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1599	39	699	PMTDF62	2027-08-22	UND	MERIL LIFE SCIENCES	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1600	39	625	PMTDF65	2027-09-15	UND	MERIL LIFE SCIENCES	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1601	39	698	PMTDF66	2027-09-16	UND	MERIL LIFE SCIENCES	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1602	39	626	PMTDF67	2027-09-17	UND	MERIL LIFE SCIENCES	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1603	39	627	PMTDF68	2027-09-20	UND	MERIL LIFE SCIENCES	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1604	39	633	PMTVD19	2028-07-18	UND	MERIL LIFE SCIENCES	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1605	39	635	PMTVD21	2028-07-21	UND	MERIL LIFE SCIENCES	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1606	39	634	PMTVD24	2028-08-02	UND	MERIL LIFE SCIENCES	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1607	39	636	PMTVD25	2028-08-07	UND	MERIL LIFE SCIENCES	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1608	39	634	PMTVD27	2028-08-29	UND	MERIL LIFE SCIENCES	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1609	39	631	PPHTC72	2027-11-04	UND	MERIL LIFE SCIENCES	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
1610	39	632	PVLDCK19	2028-08-21	UND	MERIL LIFE SCIENCES	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
1611	39	632	PVLDCK20	2028-08-23	UND	MERIL LIFE SCIENCES	15.00	25.00	17.00	\N	1.00	1.00	17.00	0.00	17.00	2026-06-17 21:48:43.619236
1612	39	706	E4747855	2030-09-02	UND	ATILIO PALMIERI S.R.L.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1613	39	708	250411A101	2028-03-31	UND	MULTI MED PERU SAC	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1614	39	586	EFG99	2028-06-21	UND	MIREL LIFE SCIENCES	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1615	39	587	EFH05	2028-06-26	UND	MIREL LIFE SCIENCES	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1616	39	585	EFH14	2028-07-05	UND	MIREL LIFE SCIENCES	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1617	39	622	MVC14	2027-09-27	UND	MERIL LIFE SCIENCES	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1618	39	619	MVC16	2027-10-06	UND	MERIL LIFE SCIENCES	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1619	39	620	MVC17	2027-10-07	UND	MERIL LIFE SCIENCES	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1620	39	696	MVC18	2027-10-13	UND	MERIL LIFE SCIENCES	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1621	39	695	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1622	39	618	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1623	39	621	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1624	39	697	PMTDF50	2027-07-05	UND	MERIL LIFE SCIENCES	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1625	39	628	PMTDF57	2027-07-31	UND	MERIL LIFE SCIENCES	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1626	39	629	PMTDF61	2027-08-20	UND	MERIL LIFE SCIENCES	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1627	39	699	PMTDF62	2027-08-22	UND	MERIL LIFE SCIENCES	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1628	39	625	PMTDF65	2027-09-15	UND	MERIL LIFE SCIENCES	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1629	39	698	PMTDF66	2027-09-16	UND	MERIL LIFE SCIENCES	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1630	39	626	PMTDF67	2027-09-17	UND	MERIL LIFE SCIENCES	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1631	39	627	PMTDF68	2027-09-20	UND	MERIL LIFE SCIENCES	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1632	39	633	PMTVC81	2028-02-11	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1633	39	633	PMTVD19	2028-07-18	UND	MERIL LIFE SCIENCES	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1634	39	635	PMTVD21	2028-07-21	UND	MERIL LIFE SCIENCES	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1635	39	634	PMTVD24	2028-08-02	UND	MERIL LIFE SCIENCES	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1636	39	636	PMTVD25	2028-08-07	UND	MERIL LIFE SCIENCES	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1396	27	776	202503027	2030-08-31	UND	ALCIMAR'S MEDIC S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-10 20:23:32.168744
1637	39	634	PMTVD27	2028-08-29	UND	MERIL LIFE SCIENCES	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1638	39	631	PPHTC72	2027-11-04	UND	MERIL LIFE SCIENCES	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
1639	39	632	PVLDCK19	2028-08-21	UND	MERIL LIFE SCIENCES	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
1640	39	632	PVLDCK20	2028-08-23	UND	MERIL LIFE SCIENCES	15.00	25.00	17.00	\N	1.00	1.00	17.00	0.00	17.00	2026-06-17 21:48:43.619236
1641	39	707	S23F1F104A	2026-05-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1643	39	686	5080571	2027-07-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1644	39	692	20231007	2026-09-30	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1645	39	752	202504042	2028-05-06	UND	GLOBAL MED INTERVENTIONAL E.I.R.L.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1646	39	694	H3318717	2028-09-02	UND	CARDIO PERFUSION EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1649	39	683	S25TZAJYAD	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1650	39	672	S25TZAOCAC	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1651	39	701	2510227448	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	200.00	\N	1.00	1.00	200.00	0.00	200.00	2026-06-17 21:48:43.619236
1652	39	702	2510227458	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	450.00	\N	1.00	1.00	450.00	0.00	450.00	2026-06-17 21:48:43.619236
1653	39	703	2510227459	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	600.00	\N	1.00	1.00	600.00	0.00	600.00	2026-06-17 21:48:43.619236
1654	39	700	2510227462	2028-10-21	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	300.00	\N	1.00	1.00	300.00	0.00	300.00	2026-06-17 21:48:43.619236
1655	39	707	S23F1F104A	2026-05-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1658	39	701	2510227448	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	200.00	\N	1.00	1.00	200.00	0.00	200.00	2026-06-17 21:48:43.619236
1659	39	702	2510227458	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	450.00	\N	1.00	1.00	450.00	0.00	450.00	2026-06-17 21:48:43.619236
1660	39	703	2510227459	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	600.00	\N	1.00	1.00	600.00	0.00	600.00	2026-06-17 21:48:43.619236
1661	39	700	2510227462	2028-10-21	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	300.00	\N	1.00	1.00	300.00	0.00	300.00	2026-06-17 21:48:43.619236
1662	39	725	24A643	2027-09-12	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1663	39	724	25A107	2028-02-17	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1664	39	720	25A251	2028-06-29	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1665	39	726	25A553	2028-08-24	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1666	39	727	25A554	2028-08-03	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1667	39	721	25A558	2028-08-24	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1668	39	722	25A574	2028-09-14	UND	MULTI MED PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1669	39	723	25A575	2028-09-14	UND	MULTI MED PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1670	39	686	5032071	2027-02-28	UND	CARDIO PERFUSION EIRL	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1671	39	686	5080571	2027-07-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1672	39	694	H3318717	2028-09-02	UND	CARDIO PERFUSION EIRL	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1678	39	707	S23F1F104A	2026-05-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1679	39	686	5032071	2027-02-28	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1680	39	686	5080571	2027-07-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1681	39	689	2309-0232	2026-08-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1682	39	708	250411A101	2028-03-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1683	39	706	E4747855	2030-09-02	UND	ATILIO PALMIERI S.R.L.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1684	39	706	E4747855	2030-09-02	UND	CARDIO PERFUSION EIRL	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1685	39	705	H3201753	2028-04-26	UND	CARDIO PERFUSION EIRL	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1686	39	733	H3283983	2028-08-08	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1687	39	733	H3283983	2028-08-08	UND	CARDIO PERFUSION EIRL	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1689	39	704	I3192257	2028-04-08	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1691	39	687	I3232620	2028-05-26	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1693	39	707	S23F1F104A	2026-05-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1397	28	777	H25B00450463	\N	UND	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 20:32:08.783673
1398	28	778	360101-M25C09810051	\N	UND	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 20:32:08.783673
1694	39	689	2309-0232	2026-08-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1695	39	728	LE240966	2029-08-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1696	39	707	S23F1F104A	2026-05-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1697	39	729	S25A1A101A	2027-12-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1698	39	702	2510227458	2028-10-22	UND	CARDIO PERFUSION EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1699	39	703	2510227459	2028-10-22	UND	CARDIO PERFUSION EIRL	15.00	25.00	17.00	\N	1.00	1.00	17.00	0.00	17.00	2026-06-17 21:48:43.619236
1700	39	700	2510227462	2028-10-21	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1701	39	666	S25TZALWAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1702	39	592	EFG94	2028-06-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1703	39	586	EFG99	2028-06-21	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1704	39	587	EFH05	2028-06-26	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1705	39	588	EFH06	2028-06-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
1706	39	590	EFH06	2028-06-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1707	39	589	EFH07	2028-06-28	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1708	39	595	EFH10	2028-06-30	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1709	39	591	EFH17	2028-07-10	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1710	39	710	EFH18	2028-07-10	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1711	39	585	EFH23	2028-07-24	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1712	39	593	EFH23	2028-07-24	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
1713	39	612	EFH26	2028-07-25	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1714	39	596	EFH39	2028-09-26	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1715	39	603	EFH40	2028-09-25	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1716	39	615	EFH41	2028-09-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1717	39	615	EFH42	2028-09-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1718	39	597	EFH43	2028-09-30	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1719	39	598	EFH43	2028-09-30	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1720	39	709	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1721	39	601	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1722	39	604	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1723	39	594	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1724	39	609	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1725	39	610	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1726	39	606	EFH47	2028-10-04	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1727	39	607	EFH48	2028-10-04	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1728	39	616	EFH48	2028-10-04	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1729	39	602	EFH50	2028-10-13	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1730	39	616	EFH51	2028-10-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1731	39	712	EFH51	2028-10-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1732	39	593	EFH53	2028-11-12	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1733	39	617	EFH56	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1734	39	711	EFH56	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1735	39	599	EFH59	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1736	39	600	EFH59	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1737	39	605	EFH60	2028-11-15	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1738	39	613	EFH62	2028-11-17	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1739	39	608	EFH63	2028-11-17	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1740	39	611	EFH63	2028-11-17	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1741	39	614	EFH64	2028-11-18	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1742	39	623	MVC08	2027-09-03	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1743	39	622	MVC18	2027-10-13	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1744	39	695	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1745	39	624	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1746	39	619	MVC20	2027-11-10	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1747	39	696	MVC21	2027-11-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1748	39	621	MVC21	2027-11-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1399	29	779	URS5070060	2027-09-10	UND	MONT GROUP SAC	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-10 20:41:25.305129
1749	39	618	MVC22	2027-11-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1750	39	620	MVC23	2027-12-04	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1751	39	628	PMTDF57	2027-07-31	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1752	39	630	PMTDF59	2027-08-06	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1753	39	629	PMTDF61	2027-08-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1754	39	697	PMTDF63	2027-08-25	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1755	39	699	PMTDF65	2027-09-15	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1756	39	698	PMTDF66	2027-09-16	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1757	39	627	PMTDF68	2027-09-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1758	39	626	PMTDF69	2027-09-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1759	39	698	PMTDF69	2027-09-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1760	39	625	PMTDF70	2027-09-21	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1761	39	633	PMTVD19	2028-07-18	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1762	39	636	PMTVD29	2028-09-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1763	39	635	PMTVD31	2028-10-02	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1764	39	634	PMTVD34	2028-10-09	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1765	39	637	POBC24	2026-08-11	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	21.00	\N	1.00	1.00	21.00	0.00	21.00	2026-06-17 21:48:43.619236
1766	39	637	POBC25	2026-08-11	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	39.00	\N	1.00	1.00	39.00	0.00	39.00	2026-06-17 21:48:43.619236
1767	39	638	POBC35	2026-09-26	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	20.00	\N	1.00	1.00	20.00	0.00	20.00	2026-06-17 21:48:43.619236
1768	39	631	PPHTC79	2027-12-05	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	28.00	\N	1.00	1.00	28.00	0.00	28.00	2026-06-17 21:48:43.619236
1769	39	632	PVLDCK25	2028-09-05	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
1770	39	730	250409A051	2028-03-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1771	39	708	250411A101	2028-03-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1772	39	682	S25TZAJPAB	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1773	39	731	2501-0324	2027-12-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1774	39	737	BLS457250201	2028-02-01	UND	ENDOMED TECNOLOGHIES S.A.C.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1775	39	728	LE240966	2029-08-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1776	39	732	S25A1A101A	2027-12-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1777	39	729	S25A1A101A	2027-12-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1780	39	700	2510227462	2028-10-21	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-06-17 21:48:43.619236
1781	39	628	PMTDF57	2027-07-31	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1782	39	630	PMTDF59	2027-08-06	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1783	39	629	PMTDF61	2027-08-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1784	39	699	PMTDF65	2027-09-15	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1785	39	698	PMTDF66	2027-09-16	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1786	39	627	PMTDF68	2027-09-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1787	39	698	PMTDF69	2027-09-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1788	39	633	PMTVD19	2028-07-18	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1789	39	636	PMTVD29	2028-09-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1790	39	635	PMTVD31	2028-10-02	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1791	39	634	PMTVD34	2028-10-09	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1792	39	631	PPHTC79	2027-12-05	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	28.00	\N	1.00	1.00	28.00	0.00	28.00	2026-06-17 21:48:43.619236
1793	39	632	PVLDCK25	2028-09-05	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
1794	39	592	EFG94	2028-06-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1795	39	586	EFG99	2028-06-21	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1796	39	587	EFH05	2028-06-26	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1797	39	588	EFH06	2028-06-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
1798	39	590	EFH06	2028-06-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1799	39	589	EFH07	2028-06-28	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1800	39	595	EFH10	2028-06-30	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1801	39	591	EFH17	2028-07-10	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1802	39	710	EFH18	2028-07-10	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1803	39	585	EFH23	2028-07-24	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1804	39	593	EFH23	2028-07-24	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
1400	30	780	1045824328	2027-08-31	UND	DIAGNOSTICA PERUANA S.A.C.	15.00	25.00	96.00	\N	1.00	1.00	96.00	0.00	96.00	2026-06-10 21:05:23.498032
1805	39	612	EFH26	2028-07-25	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1806	39	596	EFH39	2028-09-26	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1807	39	603	EFH40	2028-09-25	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1808	39	615	EFH41	2028-09-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1809	39	615	EFH42	2028-09-27	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1810	39	597	EFH43	2028-09-30	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1811	39	598	EFH43	2028-09-30	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1812	39	709	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1813	39	601	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1814	39	604	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1815	39	594	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1816	39	609	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1817	39	610	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1818	39	606	EFH47	2028-10-04	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1819	39	607	EFH48	2028-10-04	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1820	39	616	EFH48	2028-10-04	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1821	39	602	EFH50	2028-10-13	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1822	39	616	EFH51	2028-10-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1823	39	712	EFH51	2028-10-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1824	39	593	EFH53	2028-11-12	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1825	39	617	EFH56	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1826	39	711	EFH56	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1827	39	599	EFH59	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1828	39	600	EFH59	2028-11-14	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1829	39	605	EFH60	2028-11-15	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1830	39	613	EFH62	2028-11-17	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1831	39	608	EFH63	2028-11-17	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1832	39	611	EFH63	2028-11-17	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1833	39	614	EFH64	2028-11-18	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1834	39	623	MVC08	2027-09-03	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1835	39	622	MVC18	2027-10-13	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1836	39	695	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1837	39	624	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1838	39	619	MVC20	2027-11-10	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1839	39	696	MVC21	2027-11-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1840	39	621	MVC21	2027-11-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1841	39	618	MVC22	2027-11-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1842	39	620	MVC23	2027-12-04	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1843	39	697	PMTDF63	2027-08-25	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1844	39	626	PMTDF69	2027-09-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1845	39	625	PMTDF70	2027-09-21	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1846	39	637	POBC24	2026-08-11	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	21.00	\N	1.00	1.00	21.00	0.00	21.00	2026-06-17 21:48:43.619236
1847	39	637	POBC25	2026-08-11	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	39.00	\N	1.00	1.00	39.00	0.00	39.00	2026-06-17 21:48:43.619236
1848	39	638	POBC35	2026-09-26	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	20.00	\N	1.00	1.00	20.00	0.00	20.00	2026-06-17 21:48:43.619236
1849	39	713	202511609	2028-11-02	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	300.00	\N	1.00	1.00	300.00	0.00	300.00	2026-06-17 21:48:43.619236
1850	39	714	202512604	2028-12-10	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	1200.00	\N	1.00	1.00	1200.00	0.00	1200.00	2026-06-17 21:48:43.619236
1851	39	738	2024110201IF	2026-11-01	UND	ENDOMED TECNOLOGHIES S.A.C.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1852	39	737	BLS457250201	2028-02-01	UND	ENDOMED TECNOLOGHIES S.A.C.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1853	39	686	5080571	2027-07-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1856	39	702	2510227458	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-06-17 21:48:43.619236
1857	39	703	2510227459	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-06-17 21:48:43.619236
1858	39	700	2510227462	2028-10-21	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1859	39	689	2309-0232	2026-08-31	UND	AFECORP PERU S.A.C	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1860	39	725	24A643	2027-09-12	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2369	41	848	RA4539	2027-10-31	UND	H REPS S.A.C.	15.00	25.00	100.00	\N	1.00	1.00	100.00	0.00	100.00	2026-06-18 16:20:01.718087
1401	31	768	G291	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-10 21:17:07.180123
1402	31	781	G291	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 21:17:07.180123
1403	31	769	G185	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-06-10 21:17:07.180123
1404	31	782	G122	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-10 21:17:07.180123
1405	31	770	G222	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-10 21:17:07.180123
1406	31	771	D231	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-06-10 21:17:07.180123
1407	31	772	H129	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-10 21:17:07.180123
1408	31	773	H131	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	12.00	\N	1.00	1.00	12.00	0.00	12.00	2026-06-10 21:17:07.180123
1409	31	783	H122	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-10 21:17:07.180123
1410	31	784	G238	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-10 21:17:07.180123
1411	31	785	AAB	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-10 21:17:07.180123
1412	31	786	G185	\N	UND	EDVAMEDICAL E.I.R.L	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-10 21:17:07.180123
1861	39	731	2501-0324	2027-12-31	UND	PHS PERUVIAN HOSPITAL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1862	39	731	2501-0324	2027-12-31	UND	AFECORP PERU S.A.C	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1863	39	730	250409A051	2028-03-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1864	39	708	250411A101	2028-03-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	11.00	\N	1.00	1.00	11.00	0.00	11.00	2026-06-17 21:48:43.619236
1865	39	724	25A107	2028-02-17	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1866	39	720	25A251	2028-06-29	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1867	39	726	25A553	2028-08-24	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1868	39	727	25A554	2028-08-03	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1869	39	721	25A558	2028-08-24	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1870	39	723	25A575	2028-09-14	UND	MULTI MED PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1871	39	706	E4747855	2030-09-02	UND	ATILIO PALMIERI S.R.L.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1872	39	705	H3201753	2028-04-26	UND	CARDIO PERFUSION EIRL	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1873	39	733	H3283983	2028-08-08	UND	CARDIO PERFUSION EIRL	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1874	39	687	I3232620	2028-05-26	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1875	39	728	LE240966	2029-08-31	UND	AFECORP PERU S.A.C	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1876	39	728	LE240966	2029-08-31	UND	PHS PERUVIAN HOSPITAL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1877	39	729	S25A1A101A	2027-12-31	UND	AFECORP PERU S.A.C	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1878	39	732	S25A1A101A	2027-12-31	UND	AFECORP PERU S.A.C	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1879	39	729	S25A1A101A	2027-12-31	UND	PHS PERUVIAN HOSPITAL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1880	39	685	S25TZALPAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1881	39	674	S25TZARPAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1888	39	741	24A361	2027-06-17	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1889	39	725	24A643	2027-09-12	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1890	39	720	25A251	2028-06-29	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1891	39	724	25A552	2028-08-24	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1892	39	726	25A553	2028-08-24	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1893	39	721	25A558	2028-08-24	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1894	39	743	25A567	2028-08-17	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1895	39	739	25A572	2028-09-14	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1896	39	742	25A725	2028-11-23	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1897	39	740	25A763	2028-11-23	UND	MULTI MED PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1898	39	685	P25TZAFIAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1899	39	662	S25TZAFLAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1900	39	659	S25TZALJAC	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1901	39	650	S25TZANRAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1902	39	713	202511609	2028-11-02	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	45.00	\N	1.00	1.00	45.00	0.00	45.00	2026-06-17 21:48:43.619236
1903	39	714	202512604	2028-12-10	UND	OBTURATM VASCULAR CLOSURE DEVICE (6F)	15.00	25.00	100.00	\N	1.00	1.00	100.00	0.00	100.00	2026-06-17 21:48:43.619236
1904	39	728	LE240966	2029-08-31	UND	PHS PERUVIAN HOSPITAL	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1905	39	707	S23F1F104A	2026-05-31	UND	PHS PERUVIAN HOSPITAL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1906	39	729	S25A1A101A	2027-12-31	UND	PHS PERUVIAN HOSPITAL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1413	32	787	407688	2027-07-08	UND	CORPORACION LYACOS E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 21:35:21.625374
1414	32	788	304190	2027-09-02	UND	CORPORACION LYACOS E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-10 21:35:21.625374
1913	39	714	202512604	2028-12-10	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	20.00	\N	1.00	1.00	20.00	0.00	20.00	2026-06-17 21:48:43.619236
1914	39	607	EFH48	2028-10-04	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1915	39	703	2510227459	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	210.00	\N	1.00	1.00	210.00	0.00	210.00	2026-06-17 21:48:43.619236
1916	39	738	2024110201IF	2026-11-01	UND	ENDOMED TECNOLOGHIES S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1917	39	737	BLS457250201	2028-02-01	UND	ENDOMED TECNOLOGHIES S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1918	39	729	S25A1A101A	2027-12-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1919	39	702	2510227458	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1920	39	703	2510227459	2028-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1921	39	656	P25TZAEZAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1922	39	685	P25TZAFIAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1923	39	662	P25TZAFLAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1924	39	648	P25TZAFWAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1925	39	669	P25TZAFXAD	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1926	39	655	P25TZAGBAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1927	39	661	P25TZAGDAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1928	39	645	P25TZAGGAD	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1929	39	670	P25TZAGRAF	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1930	39	643	P25TZAGYAD	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1931	39	680	P25TZAHLAA	2027-08-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1932	39	682	S25TZAJPAB	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1933	39	683	S25TZAJYAD	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1934	39	682	S25TZAKHAC	2027-04-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1935	39	659	S25TZALJAC	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
1936	39	666	S25TZALWAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1937	39	644	S25TZAMAAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1938	39	646	S25TZAMXAD	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1939	39	649	S25TZAMZAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1940	39	665	S25TZANGAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1941	39	668	S25TZANGAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1942	39	683	S25TZANIAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1943	39	650	S25TZANRAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1944	39	657	S25TZAOAAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1945	39	672	S25TZAOCAC	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1946	39	671	S25TZAOIAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1947	39	676	S25TZAOLAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1948	39	658	S25TZAOOAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1949	39	653	S25TZAOZAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1950	39	651	S25TZAPAAC	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1951	39	678	S25TZAPGAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1952	39	679	S25TZAPGAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1953	39	681	S25TZAPJAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1954	39	647	S25TZAPKAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1955	39	652	S25TZAPKAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1956	39	667	S25TZAPPAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1957	39	664	S25TZAPTAD	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1958	39	654	S25TZAPYAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1959	39	681	S25TZAQOAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1960	39	681	S25TZAQSAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1961	39	675	S25TZARIAE	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1962	39	673	S25TZARJAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1963	39	660	S25TZARNAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-06-17 21:48:43.619236
1964	39	674	S25TZARPAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1965	39	680	S25TZARQAE	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1966	39	663	S25TZARYAB	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1967	39	642	S25TZASCAL	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1968	39	640	S25TZASDAB	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1969	39	641	S25TZASDAJ	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1970	39	684	S25TZASMAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1971	39	684	S25TZATHAD	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
1972	39	677	S25TZAUAAG	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1973	39	639	S25TZAUFAG	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1974	39	714	202512604	2028-12-10	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1975	39	622	MVC21	2027-11-20	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1976	39	622	MVC21	2027-11-20	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1977	39	621	MVC25	2027-12-22	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1978	39	621	MVC25	2027-12-22	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1979	39	696	MVC26	2027-12-22	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1980	39	624	MVC26	2027-12-22	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1981	39	696	MVC26	2027-12-22	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1982	39	624	MVC26	2027-12-22	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1983	39	695	MVC27	2027-12-23	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1984	39	620	MVC27	2027-12-23	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1985	39	695	MVC27	2027-12-23	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1986	39	620	MVC27	2027-12-23	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1987	39	618	MVC28	2028-01-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1988	39	618	MVC28	2028-01-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1989	39	628	PMTDF63	2027-08-25	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1990	39	628	PMTDF63	2027-08-25	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1991	39	630	PMTDF70	2027-09-21	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1992	39	630	PMTDF70	2027-09-21	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1993	39	699	PMTDF71	2027-09-25	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1994	39	699	PMTDF71	2027-09-25	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1995	39	627	PMTDF73	2027-09-28	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1996	39	627	PMTDF73	2027-09-28	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1997	39	697	PMTDF74	2027-09-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1998	39	698	PMTDF74	2027-09-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1999	39	697	PMTDF74	2027-09-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2000	39	698	PMTDF74	2027-09-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2001	39	625	PMTDF80	2027-12-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2002	39	625	PMTDF80	2027-12-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2003	39	633	PMTVD23	2028-07-31	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2004	39	633	PMTVD23	2028-07-31	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2005	39	636	PMTVD35	2028-10-14	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2006	39	636	PMTVD35	2028-10-14	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2007	39	635	PMTVD37	2028-11-03	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2008	39	635	PMTVD37	2028-11-03	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1418	34	792	784828	\N	UND	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-11 15:32:06.363193
1419	34	793	504/25	2028-07-07	UND	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-06-11 15:32:06.363193
1420	34	794	566/24	2027-06-27	UND	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-06-11 15:32:06.363193
2009	39	634	PMTVD40	2028-12-07	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
2010	39	634	PMTVD40	2028-12-07	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
2011	39	631	PPHTC88	2027-12-29	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
2012	39	631	PPHTC88	2027-12-29	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
2013	39	632	PVLDCK38	2028-10-08	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
2014	39	632	PVLDCK38	2028-10-08	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
2015	39	642	S25TZALOAJ	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2016	39	653	S25TZAMAAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2017	39	680	S25TZANFAD	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2018	39	641	S25TZAONAF	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2019	39	643	S25TZAQWAF	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2020	39	680	S25TZASCAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2021	39	684	S25TZASMAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2023	39	736	250624	2028-05-31	UND	CARDIOMED S.A.C.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
2024	39	735	250625	2028-05-31	UND	CARDIOMED S.A.C.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
2025	39	734	S23E1E111A	2026-04-30	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2026	39	619	MVC20	2027-11-10	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2027	39	626	PMTDF69	2027-09-20	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2028	39	707	S23F1F104A	2026-05-31	UND	PHS PERUVIAN HOSPITAL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2029	39	714	202512604	2028-12-10	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	100.00	\N	1.00	1.00	100.00	0.00	100.00	2026-06-17 21:48:43.619236
2030	39	744	2025112601IF	2028-11-25	UND	ENDOMED TECNOLOGHIES S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2031	39	737	BLS457250201	2028-02-01	UND	ENDOMED TECNOLOGHIES S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2032	39	707	S23F1F104A	2026-05-31	UND	ENDOMED TECNOLOGHIES S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2033	39	747	251219A191	2028-11-30	UND	MULTI MED PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2034	39	745	251224A021	2028-12-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2035	39	746	251224A041	2028-12-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2036	39	748	S25F1F102A	2028-05-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2037	39	731	2501-0324	2027-12-21	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2038	39	607	EFH48	2028-10-04	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2039	39	707	S23F1F104A	2026-05-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2040	39	748	S25F1F102A	2028-05-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2041	39	750	250516	2027-10-31	UND	CARDIOMED S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2042	39	751	250623	2027-11-30	UND	CARDIOMED S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2043	39	749	250723	2028-06-30	UND	CARDIOMED S.A.C.	15.00	25.00	50.00	\N	1.00	1.00	50.00	0.00	50.00	2026-06-17 21:48:43.619236
2044	39	624	MVC11	2027-09-16	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2045	39	624	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2046	39	630	PMTDF59	2027-08-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2048	39	752	202504042	2028-05-06	UND	GLOBAL MED INTERVENTIONAL E.I.R.L.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2049	39	624	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2050	39	621	MVC21	2027-11-20	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2051	39	620	MVC23	2027-12-04	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2052	39	630	PMTDF59	2027-08-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2053	39	627	PMTDF68	2027-09-20	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2054	39	631	PPHTC79	2027-12-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2055	39	632	PVLDCK14	2028-08-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2056	39	632	PVLDCK25	2028-09-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2057	39	753	2510227457	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2058	39	754	2510227461	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2059	39	755	2510227463	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2060	39	756	2510227466	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2061	39	802	2510227467	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2062	39	803	2510227468	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2063	39	804	2510227469	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2064	39	805	2510227470	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2065	39	806	2510227471	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2066	39	807	2510227472	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	50.00	\N	1.00	1.00	50.00	0.00	50.00	2026-06-17 21:48:43.619236
2067	39	808	2510227473	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2068	39	809	2510227474	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2069	39	810	2510227475	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2070	39	811	2510227476	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2071	39	812	2510227477	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2072	39	813	2510227478	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2073	39	814	2510227479	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2074	39	815	2510227480	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2075	39	816	2510227481	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2076	39	817	2510227482	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2077	39	818	2510227483	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2078	39	819	2510227484	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2079	39	820	2510227485	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2080	39	821	2510227486	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2081	39	822	2510227487	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2082	39	823	2510227488	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2083	39	824	2510227489	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2084	39	825	2510227490	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2085	39	826	2510227491	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2086	39	827	2510227492	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2087	39	828	2510227493	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2088	39	829	2510227494	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2089	39	830	2510227495	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2090	39	831	2510227496	2027-10-22	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2091	39	700	2601300575	2029-01-30	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	160.00	\N	1.00	1.00	160.00	0.00	160.00	2026-06-17 21:48:43.619236
2092	39	622	MVC18	2027-10-13	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2093	39	628	PMTDF57	2027-07-21	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2094	39	832	9952785	2028-08-25	UND	BOSTON SCIENTIFIC	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2095	39	832	10094788	2028-11-02	UND	BOSTON SCIENTIFIC	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2096	39	619	MVC16	2027-10-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2097	39	620	MVC27	2027-12-23	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2098	39	626	PMTDF67	2027-09-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2099	39	698	PMTDF74	2027-09-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2100	39	642	S25TZALOAJ	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2101	39	647	S25TZAPKAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2102	39	619	MVC13	2027-09-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2103	39	622	MVC14	2027-09-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2104	39	626	PMTDF52	2027-07-09	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2105	39	628	PMTDF57	2027-07-31	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2106	39	833	250403A261	2028-03-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2107	39	695	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2108	39	697	PMTDF63	2027-08-25	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2109	39	697	PMTDF63	2027-08-25	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2110	39	731	2501-0324	2027-12-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2111	39	881	I3304184	2028-08-31	UND	AFECORP PERU S.A.C	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1423	36	797	MO14100167	\N	UND	DROGUERIA IMPORTADORA ANTONIO´S E.I.R.L.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-11 19:44:50.177638
1424	36	798	MO14060356	\N	UND	DROGUERIA IMPORTADORA ANTONIO´S E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-11 19:44:50.177638
2119	39	632	PVLDCK25	2028-09-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2123	39	643	P25TZAQWAF	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2124	39	729	S25A1A101A	2027-12-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2125	39	653	S25TZAMAAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2126	39	639	S25TZAOJAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2127	39	626	PMTDF69	2027-09-20	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2131	39	717	202603608	2029-03-19	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	600.00	\N	1.00	1.00	600.00	0.00	600.00	2026-06-17 21:48:43.619236
2132	39	619	MVC13	2027-09-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2133	39	626	PMTDF52	2027-07-09	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2134	39	714	202512604	2028-12-10	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	100.00	\N	1.00	1.00	100.00	0.00	100.00	2026-06-17 21:48:43.619236
2135	39	744	2025112601IF	2028-11-25	UND	ENDOMED TECNOLOGHIES S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2136	39	834	SL240047	2029-09-30	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2137	39	736	250624	2028-05-31	UND	CARDIOMED S.A.C.	15.00	25.00	30.00	\N	1.00	1.00	30.00	0.00	30.00	2026-06-17 21:48:43.619236
2138	39	835	2603201425	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2139	39	753	2603201426	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2140	39	754	2603201432	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2141	39	755	2603201437	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2142	39	756	2603201444	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2143	39	802	2603201453	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2144	39	803	2603201456	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2145	39	804	2603201457	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2146	39	804	2603201457	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-06-17 21:48:43.619236
2147	39	805	2603201459	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2148	39	806	2603201470	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2149	39	808	2603201479	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2150	39	809	2603201481	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2151	39	810	2603201484	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	17.00	\N	1.00	1.00	17.00	0.00	17.00	2026-06-17 21:48:43.619236
2152	39	811	2603201494	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2153	39	812	2603201495	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2154	39	813	2603201503	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2155	39	814	2603201509	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2156	39	815	2603201514	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2157	39	816	2603201515	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2158	39	817	2603201521	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2159	39	819	2603201522	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2160	39	820	2603201530	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2161	39	821	2603201533	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2162	39	822	2603201536	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2163	39	823	2603201544	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2164	39	836	2603201545	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2165	39	824	2603201546	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2166	39	825	2603201547	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2167	39	826	2603201550	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2168	39	837	2603201551	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2169	39	827	2603201552	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2170	39	828	2603201554	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1361	12	574	F22B123C2	2029-12-03	UND	JAMPAR S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-01 20:56:22.3506
1425	37	799	CR-3C275446	\N	UND	BIOMEDICAL CARE SYSTEMS S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-11 20:05:38.266809
1426	37	800	CR-3C275447	\N	UND	BIOMEDICAL CARE SYSTEMS S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-11 20:05:38.266809
2171	39	829	2603201555	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2172	39	830	2603201556	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2173	39	831	2603201557	2028-03-21	UND	BE DAY GROUP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2174	39	706	E4747855	2030-09-02	UND	ATILIO PALMIERI S.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2175	39	838	2310-0379	2026-09-30	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2182	39	622	MVC10	2027-09-15	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2183	39	628	PMTDF57	2027-07-31	UND	MERIL LIFE SCIENCES	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2184	39	834	SL240047	2029-09-30	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2187	39	839	241111A011	2027-10-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2188	39	623	MVC08	2027-09-03	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2189	39	629	PMTDF61	2027-08-20	UND	MERIL LIFE SCIENCES	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2190	39	840	2405-0167	2027-04-30	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2191	39	624	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES PVT. LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2192	39	630	PMTDF59	2027-08-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2193	39	619	MVC13	2027-09-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2194	39	626	PMTDF52	2027-07-09	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2195	39	623	MVB85	2027-05-15	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2196	39	622	MVC21	2027-11-20	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2197	39	619	MVC24	2027-12-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2198	39	620	MVC25	2027-12-22	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2199	39	629	PMTDF26	2027-02-21	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2200	39	841	PMTDF63	2027-08-25	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2201	39	698	PMTDF73	2027-09-28	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2202	39	626	PMTDF76	2027-10-24	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2203	39	633	PMTVD14	2028-07-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2204	39	634	PMTVD36	2028-10-16	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2205	39	635	PMTVD37	2028-11-03	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2206	39	631	PPHTC61	2027-09-20	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2207	39	632	PVLDCK13	2028-08-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2208	39	708	251224A061	2028-12-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2209	39	746	251224A291	2028-12-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2210	39	842	260327A121	2029-03-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2211	39	744	2025112601IF	2028-11-25	UND	ENDOMED TECNOLOGHIES S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2212	39	707	S23F1F104A	2026-05-31	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2213	39	750	250516	2027-10-31	UND	CARDIOMED S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2214	39	751	250923	2028-02-29	UND	CARDIOMED S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1362	13	575	2025111701	2027-11-16	UND	LC BIOCORP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-01 21:09:26.680791
1363	13	576	2025090101	2027-08-31	UND	LC BIOCORP S.A.C.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-01 21:09:26.680791
1364	13	577	2025112201	2027-11-21	UND	LC BIOCORP S.A.C.	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-01 21:09:26.680791
1365	14	578	2025111701	2027-11-16	UND	LC BIOCORP S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-01 21:27:30.584682
1366	15	579	2024101702	2026-10-16	UND	LC BIOCORP S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-01 22:01:27.037312
1367	16	580	20251212	2030-11-30	UND	ALCIMAR´S MEDIC S.A.C.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-02 15:21:20.165941
2215	39	736	251022	2028-09-30	UND	CARDIOMED S.A.C.	15.00	25.00	55.00	\N	1.00	1.00	55.00	0.00	55.00	2026-06-17 21:48:43.619236
1369	18	582	2025121802	2027-12-17	UND	LC BIOCORP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-02 15:40:53.240312
1370	19	42	K3371732	2028-10-24	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	10.00	\N	1.00	1.00	1.00	0.00	10.00	2026-06-02 17:33:01.643082
1371	19	43	K3396584	2028-11-22	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	20.00	\N	1.00	1.00	1.00	0.00	20.00	2026-06-02 17:33:01.643082
1372	20	583	4100272	2026-09-30	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-02 21:45:11.652616
1373	20	584	I3455577	2029-02-26	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-02 21:45:11.652616
2317	39	831	2510227496	2027-10-22	UND	BE DAY GROUP S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2318	39	617	EFG22	2027-09-09	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2319	39	592	EFG94	2028-06-14	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2320	39	587	EFH05	2028-06-26	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2321	39	588	EFH06	2028-06-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2322	39	589	EFH07	2028-06-28	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2323	39	595	EFH10	2028-06-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2324	39	585	EFH14	2028-07-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2325	39	710	EFH18	2028-07-10	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2326	39	593	EFH23	2028-07-24	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2327	39	603	EFH40	2028-09-25	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2328	39	615	EFH41	2028-09-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2329	39	597	EFH43	2028-09-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2330	39	598	EFH43	2028-09-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2331	39	709	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2332	39	601	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2333	39	604	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2334	39	594	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2335	39	609	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2336	39	610	EFH45	2028-10-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2337	39	606	EFH47	2028-10-04	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2338	39	616	EFH48	2028-10-04	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2339	39	712	EFH51	2028-10-14	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2340	39	617	EFH56	2028-11-14	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2341	39	599	EFH59	2028-11-14	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2342	39	600	EFH59	2028-11-14	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2343	39	605	EFH60	2028-11-15	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2344	39	613	EFH62	2028-11-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2345	39	608	EFH63	2028-11-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2346	39	611	EFH63	2028-11-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2347	39	614	EFH64	2028-11-18	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2348	39	590	EHF06	2028-06-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2349	39	648	P25TZAFWAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2350	39	655	P25TZAGBAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2351	39	661	P25TZAGDAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2352	39	645	P25TZAGGAD	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2353	39	676	S25TZAOLAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2354	39	678	S25TZAPGAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2355	39	679	S25TZAPGAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2356	39	673	S25TZARJAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2357	39	640	S25TZASDAB	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2358	39	684	S25TZASMAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2359	39	684	S25TZATHAD	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2360	39	677	S25TZAUAAG	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2371	43	700	2605189335	2029-05-17	UND	BROSMED MEDICAL CO., LTD.	15.00	25.00	300.00	\N	1.00	1.00	300.00	0.00	300.00	2026-06-18 19:28:15.300949
2372	44	624	MVC19	2027-10-15	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:06:31.062919
2373	44	630	PMTDF59	2027-08-06	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:06:31.062919
2374	44	631	PPHTC88	2027-12-29	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:06:31.062919
2375	44	632	PVLDCK38	2028-10-08	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:06:31.062919
2376	44	636	PMTDF29	2028-09-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:06:31.062919
2381	46	632	PVLDCK13	2028-08-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:36:26.752392
2382	47	681	S25TZAQOAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:47:47.484128
2383	47	683	S25TZANIAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:47:47.484128
2384	47	659	S25TZALJAC	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:47:47.484128
2385	47	683	S25TZANIAA	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:47:47.484128
2386	47	681	S25TZAQSAA	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:47:47.484128
2387	47	717	202512604	2028-12-10	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 20:47:47.484128
2378	45	882	I3455577	2029-02-26	UND	AFECORP PERU S.A.C.	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-18 20:21:20.075229
2379	45	892	K3371732	2028-10-24	UND	AFECORP PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-18 20:21:20.075229
2380	45	883	K3396584	2028-11-22	UND	AFECORP PERU S.A.C.	15.00	25.00	20.00	\N	1.00	1.00	20.00	0.00	20.00	2026-06-18 20:21:20.075229
2388	48	845	250910	2028-02-29	UND	CARDIOMED S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-18 21:17:00.009799
2389	49	713	202511609	2028-11-02	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	195.00	\N	1.00	1.00	195.00	0.00	195.00	2026-06-18 21:26:14.618097
2390	50	653	S25TZAOZAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 21:36:37.42468
2391	50	659	S25TZALJAC	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 21:36:37.42468
2392	50	661	P25TZAGDAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 21:36:37.42468
2393	50	671	S25TZAOIAB	2027-05-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 21:36:37.42468
2394	50	617	EFH56	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 21:36:37.42468
2395	51	746	251224A291	2028-12-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-18 21:45:17.982226
2396	51	842	260327A121	2029-03-31	UND	MULTI MED PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-18 21:45:17.982226
2397	52	606	EFH47	2028-10-04	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 21:57:12.389588
2398	52	684	S25TZASMAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-18 21:57:12.389588
142	3	873	2025255	2030-08-01	UND	EOMEDICA SAC	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-22 15:04:48.568127
143	3	874	2601061	2031-01-25	UND	QINGDAO HIPROVE MEDICAL TECHNOLOGIES CO.,LTD	15.00	25.00	5000.00	\N	1.00	1.00	5000.00	0.00	5000.00	2026-05-22 15:04:48.568127
144	3	874	2601062	2031-01-25	UND	QINGDAO HIPROVE MEDICAL TECHNOLOGIES CO.,LTD	15.00	25.00	7000.00	\N	1.00	1.00	7000.00	0.00	7000.00	2026-05-22 15:04:48.568127
145	3	873	2025255	2030-08-01	UND	EOMEDICA SAC	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-05-22 15:04:48.568127
146	3	873	2025255	2030-08-01	UND	EOMEDICA SAC	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-05-22 15:04:48.568127
2377	45	875	4100272	2026-09-30	UND	AFECORP PERU S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-18 20:21:20.075229
2291	39	876	2506106166	2028-06-09	UND	AFECORP PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2292	39	877	2511114218	2028-11-10	UND	AFECORP PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2293	39	878	SP1125121506	2028-12-23	UND	AFECORP PERU S.A.C.	15.00	25.00	20.00	\N	1.00	1.00	20.00	0.00	20.00	2026-06-17 21:48:43.619236
2294	39	879	SP5324121808	2027-12-18	UND	AFECORP PERU S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2295	39	880	SP5325022829	2028-03-02	UND	AFECORP PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2296	39	880	SP5325082210	2028-08-23	UND	AFECORP PERU S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1515	39	881	I3162108	2028-03-03	UND	CARDIO PERFUSION EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1516	39	882	I3197593	2028-04-22	UND	CARDIO PERFUSION EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1518	39	882	I3248498	2028-06-10	UND	CARDIO PERFUSION EIRL	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1519	39	883	K3242383	2028-05-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
1642	39	883	K3242383	2028-05-31	UND	CARDIO PERFUSION E.I.R.L	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1647	39	881	I3162108	2028-03-03	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1648	39	883	K3242383	2028-05-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1656	39	877	2504259336	2028-04-24	UND	AFECORP PERU S.A.C.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
1657	39	876	2506106166	2028-04-24	UND	AFECORP PERU S.A.C.	15.00	25.00	25.00	\N	1.00	1.00	25.00	0.00	25.00	2026-06-17 21:48:43.619236
1673	39	881	I3162108	2028-03-03	UND	CARDIO PERFUSION EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1674	39	882	I3197593	2028-04-22	UND	CARDIO PERFUSION EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1675	39	882	I3197593	2028-04-22	UND	CARDIO PERFUSION EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1676	39	882	I3248498	2028-06-10	UND	CARDIO PERFUSION EIRL	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
1677	39	883	K3242383	2028-05-31	UND	CARDIO PERFUSION EIRL	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
1688	39	881	I3162108	2028-03-03	UND	CARDIO PERFUSION EIRL	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1690	39	882	I3197593	2028-04-22	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1692	39	882	I3248498	2028-06-10	UND	CARDIO PERFUSION EIRL	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1778	39	877	2504259336	2028-04-24	UND	AFECORP PERU S.A.C.	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
1779	39	876	2506106166	2028-06-09	UND	AFECORP PERU S.A.C.	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
1854	39	877	2504259336	2028-04-24	UND	AFECORP PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1855	39	876	2506106166	2028-06-09	UND	AFECORP PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1882	39	884	SP1124052316	2027-06-18	UND	AFECORP PERU S.A.C	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1883	39	885	SP4125022813	2028-03-02	UND	AFECORP PERU S.A.C	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1884	39	886	SP4125080402	2028-08-05	UND	AFECORP PERU S.A.C	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
1885	39	887	SP5024091403	2027-09-23	UND	AFECORP PERU S.A.C	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1886	39	888	SP5025090304	2028-09-03	UND	AFECORP PERU S.A.C	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1887	39	880	SP5325022829	2028-03-02	UND	AFECORP PERU S.A.C	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
1907	39	884	SP1124052316	2027-06-18	UND	AFECORP PERU S.A.C	15.00	25.00	14.00	\N	1.00	1.00	14.00	0.00	14.00	2026-06-17 21:48:43.619236
1908	39	878	SP1125081407	2028-08-19	UND	AFECORP PERU S.A.C	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
1909	39	889	SP4125022805	2028-03-02	UND	AFECORP PERU S.A.C	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1910	39	890	SP4125031203	2028-03-19	UND	AFECORP PERU S.A.C	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
1911	39	888	SP5025090304	2028-09-03	UND	AFECORP PERU S.A.C	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
1912	39	880	SP5325022829	2028-03-02	UND	AFECORP PERU S.A.C	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2022	39	880	SP5325041706	2028-04-15	UND	AFECORP PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2047	39	880	SP5325041706	2028-04-15	UND	AFECORP PERU S.A.C	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-06-17 21:48:43.619236
2112	39	891	I3356223	2028-10-27	UND	AFECORP PERU S.A.C	15.00	25.00	7.00	\N	1.00	1.00	7.00	0.00	7.00	2026-06-17 21:48:43.619236
2113	39	891	I3356227	2028-11-11	UND	AFECORP PERU S.A.C	15.00	25.00	4.00	\N	1.00	1.00	4.00	0.00	4.00	2026-06-17 21:48:43.619236
2114	39	881	I3370429	2028-10-10	UND	AFECORP PERU S.A.C	15.00	25.00	21.00	\N	1.00	1.00	21.00	0.00	21.00	2026-06-17 21:48:43.619236
2115	39	883	K3371675	2028-10-24	UND	AFECORP PERU S.A.C	15.00	25.00	80.00	\N	1.00	1.00	80.00	0.00	80.00	2026-06-17 21:48:43.619236
2116	39	892	K3371732	2028-10-24	UND	AFECORP PERU S.A.C	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2117	39	876	2506106166	2028-06-09	UND	AFECORP PERU S.A.C	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2118	39	877	2511114218	2028-11-10	UND	AFECORP PERU S.A.C	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2120	39	878	SP1125081407	2028-08-19	UND	AFECORP PERU S.A.C	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-06-17 21:48:43.619236
2121	39	879	SP5324121808	2027-12-18	UND	AFECORP PERU S.A.C	15.00	25.00	9.00	\N	1.00	1.00	9.00	0.00	9.00	2026-06-17 21:48:43.619236
2122	39	880	SP5325041706	2028-04-15	UND	AFECORP PERU S.A.C	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-06-17 21:48:43.619236
2128	39	893	H2735360	2026-08-04	UND	AFECORP PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2129	39	894	H3247331	2028-02-28	UND	AFECORP PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2130	39	891	I3304488	2028-08-18	UND	AFECORP PERU S.A.C.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-17 21:48:43.619236
2176	39	895	6021241	2027-12-31	UND	AFECORP PERU S.A.C.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-17 21:48:43.619236
2177	39	876	2506106166	2028-06-09	UND	AFECORP PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2178	39	877	2511114218	2028-11-10	UND	AFECORP PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2179	39	882	I3356253	2028-10-20	UND	AFECORP PERU S.A.C.	15.00	25.00	15.00	\N	1.00	1.00	15.00	0.00	15.00	2026-06-17 21:48:43.619236
2180	39	896	I3385327	2028-09-30	UND	AFECORP PERU S.A.C.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2181	39	883	K3377984	2028-11-01	UND	AFECORP PERU S.A.C.	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
2185	39	879	SP5324121808	2027-12-18	UND	AFECORP PERU S.A.C.	15.00	25.00	3.00	\N	1.00	1.00	3.00	0.00	3.00	2026-06-17 21:48:43.619236
2186	39	880	SP5325041706	2028-04-15	UND	AFECORP PERU S.A.C.	15.00	25.00	8.00	\N	1.00	1.00	8.00	0.00	8.00	2026-06-17 21:48:43.619236
2361	39	884	SP1124052316	2027-06-18	UND	AFECORP PERU S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-17 21:48:43.619236
2362	39	885	SP4125022813	2028-03-02	UND	AFECORP PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2363	39	890	SP4125031203	2028-03-19	UND	AFECORP PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2364	39	886	SP4125080402	2028-08-05	UND	AFECORP PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2365	39	887	SP5024091403	2027-09-23	UND	AFECORP PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2366	39	888	SP5025090304	2028-09-03	UND	AFECORP PERU S.A.C.	15.00	25.00	2.00	\N	1.00	1.00	2.00	0.00	2.00	2026-06-17 21:48:43.619236
2367	39	880	SP5325022829	2028-03-02	UND	AFECORP PERU S.A.C.	15.00	25.00	10.00	\N	1.00	1.00	10.00	0.00	10.00	2026-06-17 21:48:43.619236
2399	53	585	EFH14	2028-07-05	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2400	53	586	EFG99	2028-06-21	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2401	53	587	EFH05	2028-06-26	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2402	53	642	S25TZASCAL	2027-07-31	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2403	53	589	EFH07	2028-06-28	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2404	53	645	P25TZAGGAD	2027-06-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2405	53	593	EFH23	2028-07-24	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2406	53	648	P25TZAFWAA	2027-06-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2407	53	650	S25TZANRAA	2027-05-31	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2408	53	651	S25TZAPAAC	2027-06-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2409	53	652	S25TZAPKAA	2027-06-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2410	53	653	S25TZAOZAB	2027-06-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2411	53	602	EFH50	2028-10-13	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2412	53	683	S25TZAJYAD	2027-04-30	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2413	53	604	EFH44	2028-10-01	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2414	53	608	EFH63	2028-11-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2415	53	611	EFH63	2028-11-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2416	53	613	EFH62	2028-11-17	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2417	53	614	EFH64	\N	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2418	53	615	EFH42	2028-09-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2419	53	672	S25TZAOCAC	2027-05-31	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 16:24:27.760596
2420	54	661	P25TZAGDAB	2027-06-30	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 17:20:28.69059
2421	54	673	S25TZARJAC	2027-07-31	UND	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 17:20:28.69059
2422	54	614	EFH64	2028-11-18	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 17:20:28.69059
2423	54	615	EFH41	2028-09-27	UND	MERIL LIFE SCIENCES PVT LTD.	15.00	25.00	1.00	\N	1.00	1.00	1.00	0.00	1.00	2026-06-19 17:20:28.69059
2424	55	840	2405-0167	2027-04-30	UND	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	15.00	25.00	6.00	\N	1.00	1.00	6.00	0.00	6.00	2026-06-19 17:38:36.828358
2425	56	700	2605189335	2029-05-17	UND	BROSMED MEDICAL CO.,LTD.	15.00	25.00	300.00	\N	1.00	1.00	300.00	0.00	300.00	2026-06-19 17:51:36.270972
2426	56	717	202604636	2029-04-27	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	500.00	\N	1.00	1.00	500.00	0.00	500.00	2026-06-19 17:51:36.270972
2427	56	713	202604635	2029-04-27	UND	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	15.00	25.00	200.00	\N	1.00	1.00	200.00	0.00	200.00	2026-06-19 17:51:36.270972
2428	57	877	2504259336	2028-04-24	UND	AFECORP PERU S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-19 18:02:49.020161
2429	57	876	2506106166	2028-06-09	UND	AFECORP PERU S.A.C.	15.00	25.00	5.00	\N	1.00	1.00	5.00	0.00	5.00	2026-06-19 18:02:49.020161
\.


--
-- Data for Name: nota_salida_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_salida_detalles (id, nota_salida_id, producto_id, lote_id, cantidad, precio_unitario, created_at, cant_bulto, cant_caja, cant_x_caja, cant_fraccion, lote_numero, fecha_vencimiento, um, fabricante, temperatura_min_c, temperatura_max_c, cantidad_total) FROM stdin;
89	4	1	\N	1100.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	1100.00	0.00	99532	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	1100.00
90	4	2	\N	500.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	500.00	0.00	99530	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	500.00
91	4	1	\N	1350.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	1350.00	0.00	99532	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	1350.00
92	4	2	\N	500.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	500.00	0.00	99530	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	500.00
93	4	1	\N	1350.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	1350.00	0.00	99532	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	1350.00
94	4	2	\N	500.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	500.00	0.00	99530	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	500.00
95	4	3	\N	400.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	400.00	0.00	FST25062001	2028-06-20	\N	AMERICAN INTERNATIONAL INDUSTRIES	\N	\N	400.00
96	4	3	\N	420.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	420.00	0.00	FST25062001	2028-06-20	\N	AMERICAN INTERNATIONAL INDUSTRIES	\N	\N	420.00
97	4	1	\N	1350.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	1350.00	0.00	99532	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	1350.00
98	4	2	\N	500.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	500.00	0.00	99530	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	500.00
99	4	3	\N	380.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	380.00	0.00	FST25062001	2028-06-20	\N	AMERICAN INTERNATIONAL INDUSTRIES	\N	\N	380.00
100	4	1	\N	1350.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	1350.00	0.00	99532	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	1350.00
101	4	2	\N	500.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	500.00	0.00	99530	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	500.00
102	4	1	\N	1350.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	1350.00	0.00	99532	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	1350.00
103	4	2	\N	500.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	500.00	0.00	99530	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	500.00
104	4	1	\N	2550.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	2550.00	0.00	99532	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	2550.00
105	4	2	\N	1000.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	1000.00	0.00	99530	2028-04-01	\N	INDUSTRIE PAGODA SRL	\N	\N	1000.00
106	4	11	\N	60.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	60.00	0.00	33998	2028-06-27	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	60.00
107	4	12	\N	120.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	120.00	0.00	34047	2028-06-13	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	120.00
108	4	13	\N	90.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	90.00	0.00	32965	2028-04-11	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	90.00
109	4	14	\N	120.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	120.00	0.00	34985	2028-09-30	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	120.00
110	4	15	\N	120.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	120.00	0.00	34415	2028-07-10	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	120.00
111	4	24	\N	90.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	90.00	0.00	35201	2027-10-16	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	90.00
112	4	16	\N	200.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	200.00	0.00	34413	2027-07-08	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	200.00
113	4	17	\N	400.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	400.00	0.00	35088	2027-10-13	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	400.00
114	4	18	\N	160.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	160.00	0.00	34374	2027-07-04	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	160.00
115	4	19	\N	150.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	150.00	0.00	34525	2027-07-18	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	150.00
116	4	20	\N	90.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	90.00	0.00	35133	2027-10-14	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	90.00
117	4	21	\N	87.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	87.00	0.00	32781	2028-04-01	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	87.00
118	4	22	\N	100.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	100.00	0.00	34689	2027-08-12	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	100.00
119	4	23	\N	100.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	100.00	0.00	34919	2027-09-09	\N	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	100.00
120	4	4	\N	10.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	10.00	0.00	SP5325022829	2028-03-02	\N	JOSSON MEDICAL EIRL	\N	\N	10.00
121	4	6	\N	5.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	5.00	0.00	SP1124052316	2027-06-18	\N	JOSSON MEDICAL EIRL	\N	\N	5.00
122	4	7	\N	2.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	2.00	0.00	SP4125031203	2028-03-19	\N	JOSSON MEDICAL EIRL	\N	\N	2.00
123	4	8	\N	2.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	2.00	0.00	SP4125022813	2028-03-02	\N	JOSSON MEDICAL EIRL	\N	\N	2.00
124	4	10	\N	2.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	2.00	0.00	SP4125080402	2028-08-05	\N	JOSSON MEDICAL EIRL	\N	\N	2.00
125	4	25	\N	2.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	2.00	0.00	SP5024091403	2027-09-23	\N	JOSSON MEDICAL EIRL	\N	\N	2.00
126	4	26	\N	2.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	2.00	0.00	SP5025090304	2028-09-03	\N	JOSSON MEDICAL EIRL	\N	\N	2.00
127	4	9	\N	5.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	5.00	0.00	SP1125081407	2028-08-19	\N	JOSSON MEDICAL EIRL	\N	\N	5.00
128	4	4	\N	5.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	5.00	0.00	SP5325022829	2028-03-02	\N	JOSSON MEDICAL EIRL	\N	\N	5.00
129	4	6	\N	14.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	14.00	0.00	SP1124052316	2027-06-18	\N	JOSSON MEDICAL EIRL	\N	\N	14.00
130	4	37	\N	6.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	6.00	0.00	SP4125022805	2028-03-02	\N	JOSSON MEDICAL EIRL	\N	\N	6.00
131	4	7	\N	6.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	6.00	0.00	SP4125031203	2028-03-19	\N	JOSSON MEDICAL EIRL	\N	\N	6.00
132	4	26	\N	2.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	2.00	0.00	SP5025090304	2028-09-03	\N	JOSSON MEDICAL EIRL	\N	\N	2.00
133	4	4	\N	10.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	10.00	0.00	SP5325041706	2028-04-15	\N	JOSSON MEDICAL EIRL	\N	\N	10.00
134	4	33	\N	36.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	36.00	0.00	VM03	2029-05-31	\N	KIN COSMETICS S.A.U.	\N	\N	36.00
135	4	34	\N	90.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	90.00	0.00	SM04	2029-07-31	\N	KIN COSMETICS S.A.U.	\N	\N	90.00
136	4	35	\N	24.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	24.00	0.00	VM03	2029-05-31	\N	KIN COSMETICS S.A.U.	\N	\N	24.00
137	4	36	\N	90.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	90.00	0.00	VM03/38	2029-05-31	\N	KIN COSMETICS S.A.U.	\N	\N	90.00
138	4	27	\N	48.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	48.00	0.00	VM03	2029-05-31	\N	KIN COSMETICS S.A.U.	\N	\N	48.00
139	4	28	\N	48.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	48.00	0.00	SM04	2029-07-31	\N	KIN COSMETICS S.A.U.	\N	\N	48.00
140	4	29	\N	48.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	48.00	0.00	VM03	2029-05-31	\N	KIN COSMETICS S.A.U.	\N	\N	48.00
141	4	30	\N	36.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	36.00	0.00	VM03/38	2029-05-31	\N	KIN COSMETICS S.A.U.	\N	\N	36.00
142	4	31	\N	36.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	36.00	0.00	PL02/17	2028-10-31	\N	KIN COSMETICS S.A.U.	\N	\N	36.00
143	4	32	\N	24.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	24.00	0.00	TM04/64	2029-06-30	\N	KIN COSMETICS S.A.U.	\N	\N	24.00
144	4	4	\N	15.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	15.00	0.00	SP5325041706	2028-04-15	\N	JOSSON MEDICAL EIRL	\N	\N	15.00
145	4	41	\N	21.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	21.00	0.00	I3370429	2028-10-10	\N	CARDIO PERFUSION E.I.R.L	\N	\N	21.00
146	4	42	\N	5.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	5.00	0.00	K3371732	2028-10-24	\N	CARDIO PERFUSION E.I.R.L	\N	\N	5.00
147	4	43	\N	80.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	80.00	0.00	K3371675	2028-10-24	\N	CARDIO PERFUSION E.I.R.L	\N	\N	80.00
148	4	44	\N	4.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	4.00	0.00	I3356227	2028-11-11	\N	CARDIO PERFUSION E.I.R.L	\N	\N	4.00
149	4	41	\N	4.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	4.00	0.00	I3304184	2028-08-31	\N	CARDIO PERFUSION E.I.R.L	\N	\N	4.00
150	4	44	\N	7.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	7.00	0.00	I3356223	2028-10-27	\N	CARDIO PERFUSION E.I.R.L	\N	\N	7.00
151	4	9	\N	9.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	9.00	0.00	SP1125081407	2028-08-19	\N	JOSSON MEDICAL EIRL	\N	\N	9.00
152	4	5	\N	9.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	9.00	0.00	SP5324121808	2027-12-18	\N	JOSSON MEDICAL EIRL	\N	\N	9.00
153	4	4	\N	15.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	15.00	0.00	SP5325041706	2028-04-15	\N	JOSSON MEDICAL EIRL	\N	\N	15.00
154	4	45	\N	10.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	10.00	0.00	2511114218	2028-11-10	\N	JOSSON MEDICAL EIRL	\N	\N	10.00
155	4	46	\N	10.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	10.00	0.00	2506106166	2028-06-09	\N	JOSSON MEDICAL EIRL	\N	\N	10.00
156	4	44	\N	6.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	6.00	0.00	I3304488	2028-08-18	\N	CARDIO PERFUSION E.I.R.L	\N	\N	6.00
157	4	47	\N	1.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	1.00	0.00	H2735360	2026-08-04	\N	CARDIO PERFUSION E.I.R.L	\N	\N	1.00
158	4	48	\N	1.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	1.00	0.00	H3247331	2028-02-28	\N	CARDIO PERFUSION E.I.R.L	\N	\N	1.00
159	4	4	\N	8.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	8.00	0.00	SP5325041706	2028-04-15	\N	JOSSON MEDICAL EIRL	\N	\N	8.00
160	4	45	\N	10.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	10.00	0.00	2511114218	2028-11-10	\N	JOSSON MEDICAL EIRL	\N	\N	10.00
161	4	46	\N	10.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	10.00	0.00	2506106166	2028-06-09	\N	JOSSON MEDICAL EIRL	\N	\N	10.00
162	4	5	\N	3.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	3.00	0.00	SP5324121808	2027-12-18	\N	JOSSON MEDICAL EIRL	\N	\N	3.00
163	4	49	\N	3.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	3.00	0.00	I3385327	2028-09-30	\N	CARDIO PERFUSION E.I.R.L	\N	\N	3.00
164	4	43	\N	8.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	8.00	0.00	K3377984	2028-11-01	\N	CARDIO PERFUSION E.I.R.L	\N	\N	8.00
165	4	50	\N	15.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	15.00	0.00	I3356253	2028-10-20	\N	CARDIO PERFUSION E.I.R.L	\N	\N	15.00
166	4	51	\N	1.00	\N	2026-05-21 17:49:31.918911	1.00	1.00	1.00	0.00	6021241	2027-12-31	\N	CARDIO PERFUSION E.I.R.L	\N	\N	1.00
167	5	55	\N	90.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	90.00	0.00	2509095101	2029-09-26	\N	SUAVINEX GROUP, S.L	\N	\N	90.00
168	5	55	\N	1206.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	1206.00	0.00	2510010701	2029-10-07	\N	SUAVINEX GROUP, S.L	\N	\N	1206.00
169	5	55	\N	948.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	948.00	0.00	2510010701	2029-10-07	\N	SUAVINEX GROUP, S.L	\N	\N	948.00
170	5	55	\N	1356.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	1356.00	0.00	2510003001	2029-10-07	\N	SUAVINEX GROUP, S.L	\N	\N	1356.00
171	5	59	\N	486.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	486.00	0.00	2511015301	2029-11-07	\N	SUAVINEX GROUP, S.L	\N	\N	486.00
172	5	61	\N	1080.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	1080.00	0.00	2512003601	2029-12-09	\N	SUAVINEX GROUP, S.L	\N	\N	1080.00
173	5	52	\N	603.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	603.00	0.00	2511090101	2029-11-24	\N	SUAVINEX GROUP, S.L	\N	\N	603.00
174	5	56	\N	1215.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	1215.00	0.00	2510067901	2029-10-17	\N	SUAVINEX GROUP, S.L	\N	\N	1215.00
175	5	77	\N	210.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	210.00	0.00	2511022701	2029-11-12	\N	SUAVINEX GROUP, S.L	\N	\N	210.00
176	5	70	\N	660.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	660.00	0.00	25101143	2028-10-01	\N	SUAVINEX GROUP, S.L	\N	\N	660.00
177	5	54	\N	270.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	270.00	0.00	2510042301	2029-10-14	\N	SUAVINEX GROUP, S.L	\N	\N	270.00
178	5	58	\N	540.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	540.00	0.00	2511014801	\N	\N	SUAVINEX GROUP, S.L	\N	\N	540.00
179	5	53	\N	432.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	432.00	0.00	2511047801	2029-11-25	\N	SUAVINEX GROUP, S.L	\N	\N	432.00
180	5	78	\N	324.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	324.00	0.00	25110097	2028-11-17	\N	SUAVINEX GROUP, S.L	\N	\N	324.00
181	5	63	\N	162.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	162.00	0.00	2509098301	2029-10-02	\N	SUAVINEX GROUP, S.L	\N	\N	162.00
182	5	64	\N	162.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	162.00	0.00	2510071701	2029-10-22	\N	SUAVINEX GROUP, S.L	\N	\N	162.00
183	5	65	\N	162.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	162.00	0.00	2509047201	2029-09-17	\N	SUAVINEX GROUP, S.L	\N	\N	162.00
184	5	66	\N	162.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	162.00	0.00	2510098701	2029-10-24	\N	SUAVINEX GROUP, S.L	\N	\N	162.00
185	5	72	\N	78.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	78.00	0.00	2507002501	2029-07-02	\N	SUAVINEX GROUP, S.L	\N	\N	78.00
186	5	67	\N	78.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	78.00	0.00	2509092101	2029-09-26	\N	SUAVINEX GROUP, S.L	\N	\N	78.00
187	5	57	\N	12.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	12.00	0.00	2509030901	2029-09-08	\N	SUAVINEX GROUP, S.L	\N	\N	12.00
188	5	57	\N	78.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	78.00	0.00	2510041201	\N	\N	SUAVINEX GROUP, S.L	\N	\N	78.00
189	5	82	\N	1860.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	1860.00	0.00	2511086701	2029-11-27	\N	SUAVINEX GROUP, S.L	\N	\N	1860.00
190	5	59	\N	1296.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	1296.00	0.00	2511090601	2029-11-21	\N	SUAVINEX GROUP, S.L	\N	\N	1296.00
191	5	81	\N	828.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	828.00	0.00	2506030700	\N	\N	SUAVINEX GROUP, S.L	\N	\N	828.00
192	5	88	\N	576.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	576.00	0.00	2511053301	2029-11-17	\N	SUAVINEX GROUP, S.L	\N	\N	576.00
193	5	61	\N	486.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	486.00	0.00	2510042801	2029-10-13	\N	SUAVINEX GROUP, S.L	\N	\N	486.00
194	5	83	\N	105.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	105.00	0.00	2503052801	2029-03-27	\N	SUAVINEX GROUP, S.L	\N	\N	105.00
195	5	77	\N	240.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	240.00	0.00	2511022701	2029-11-12	\N	SUAVINEX GROUP, S.L	\N	\N	240.00
196	5	86	\N	189.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	189.00	0.00	2510075501	\N	\N	SUAVINEX GROUP, S.L	\N	\N	189.00
197	5	87	\N	126.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	126.00	0.00	2511023301	\N	\N	SUAVINEX GROUP, S.L	\N	\N	126.00
198	5	85	\N	126.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	126.00	0.00	2510075401	2029-10-20	\N	SUAVINEX GROUP, S.L	\N	\N	126.00
199	5	80	\N	72.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	72.00	0.00	2505032900	\N	\N	SUAVINEX GROUP, S.L	\N	\N	72.00
200	5	79	\N	72.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	72.00	0.00	2411062100	\N	\N	SUAVINEX GROUP, S.L	\N	\N	72.00
201	5	77	\N	180.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	180.00	0.00	2511022701	2029-11-12	\N	SUAVINEX GROUP, S.L	\N	\N	180.00
202	5	56	\N	450.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	450.00	0.00	2510067901	2029-10-17	\N	SUAVINEX GROUP, S.L	\N	\N	450.00
203	5	75	\N	30.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	30.00	0.00	2510049801	2029-10-15	\N	SUAVINEX GROUP, S.L	\N	\N	30.00
204	5	75	\N	318.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	318.00	0.00	2510075001	2029-10-21	\N	SUAVINEX GROUP, S.L	\N	\N	318.00
205	5	76	\N	48.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	48.00	0.00	2506268201	2029-07-03	\N	SUAVINEX GROUP, S.L	\N	\N	48.00
206	5	62	\N	32.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	32.00	0.00	2308074801	2028-03-14	\N	SUAVINEX GROUP, S.L	\N	\N	32.00
207	5	62	\N	48.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	48.00	0.00	2403049101	2028-03-14	\N	SUAVINEX GROUP, S.L	\N	\N	48.00
208	5	71	\N	144.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	144.00	0.00	2402052101	2028-02-20	\N	SUAVINEX GROUP, S.L	\N	\N	144.00
209	5	52	\N	702.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	702.00	0.00	2511090101	2029-11-24	\N	SUAVINEX GROUP, S.L	\N	\N	702.00
210	5	61	\N	1188.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	1188.00	0.00	2512003601	2029-12-09	\N	SUAVINEX GROUP, S.L	\N	\N	1188.00
211	5	53	\N	108.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	108.00	0.00	2510043501	2029-10-15	\N	SUAVINEX GROUP, S.L	\N	\N	108.00
212	5	54	\N	378.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	378.00	0.00	2510042301	2029-10-14	\N	SUAVINEX GROUP, S.L	\N	\N	378.00
213	5	73	\N	69.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	69.00	0.00	2507028801	2029-07-10	\N	SUAVINEX GROUP, S.L	\N	\N	69.00
214	5	73	\N	87.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	87.00	0.00	2511048601	2029-11-17	\N	SUAVINEX GROUP, S.L	\N	\N	87.00
215	5	68	\N	156.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	156.00	0.00	2509111101	2029-10-01	\N	SUAVINEX GROUP, S.L	\N	\N	156.00
216	5	69	\N	78.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	78.00	0.00	2509109401	2029-09-29	\N	SUAVINEX GROUP, S.L	\N	\N	78.00
217	5	74	\N	78.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	78.00	0.00	2507076601	2029-08-26	\N	SUAVINEX GROUP, S.L	\N	\N	78.00
218	5	78	\N	252.00	\N	2026-05-21 21:06:17.11392	1.00	1.00	306.00	0.00	25110097	2028-11-17	\N	SUAVINEX GROUP, S.L	\N	\N	252.00
219	6	84	\N	396.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	124.00	0.00	2506049601	2029-06-13	\N	SUAVINEX GROUP, S.L	\N	\N	396.00
220	6	76	\N	320.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	64.00	0.00	2506268201	2029-07-03	\N	SUAVINEX GROUP, S.L	\N	\N	320.00
221	6	76	\N	224.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	224.00	0.00	2504068001	2029-05-08	\N	SUAVINEX GROUP, S.L	\N	\N	224.00
222	6	61	\N	150.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	42.00	0.00	2510042801	2029-10-13	\N	SUAVINEX GROUP, S.L	\N	\N	150.00
223	6	61	\N	642.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	642.00	0.00	2510115601	2029-11-05	\N	SUAVINEX GROUP, S.L	\N	\N	642.00
224	6	81	\N	1116.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	1944.00	0.00	2506030700	\N	\N	SUAVINEX GROUP, S.L	\N	\N	1116.00
225	6	81	\N	2988.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	2988.00	0.00	2505004800	\N	\N	SUAVINEX GROUP, S.L	\N	\N	2988.00
226	6	59	\N	1344.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	1344.00	0.00	2512012101	2029-12-10	\N	SUAVINEX GROUP, S.L	\N	\N	1344.00
227	6	59	\N	762.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	1248.00	0.00	2511015301	2029-11-07	\N	SUAVINEX GROUP, S.L	\N	\N	762.00
228	6	88	\N	384.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	960.00	0.00	2511053301	2029-11-17	\N	SUAVINEX GROUP, S.L	\N	\N	384.00
229	6	83	\N	9.00	\N	2026-05-21 21:43:34.983856	1.00	1.00	114.00	0.00	2503052801	2029-03-27	\N	SUAVINEX GROUP, S.L	\N	\N	9.00
237	8	98	125	70.00	\N	2026-05-22 17:09:57.514601	1.00	1.00	70.00	0.00	IN1240527	2027-03-27	\N	PFH LAB MEDIC E.I.R.L.	\N	\N	70.00
238	8	100	127	53.00	\N	2026-05-22 17:09:57.514601	1.00	1.00	53.00	0.00	303919	2027-04-19	\N	CORPORACION LYACOS E.I.R.L	\N	\N	53.00
239	8	99	126	70.00	\N	2026-05-22 17:09:57.514601	1.00	1.00	70.00	0.00	IN250523	2027-12-23	\N	PFH LAB MEDIC E.I.R.L.	\N	\N	70.00
240	9	96	123	50.00	\N	2026-05-22 17:14:08.486781	1.00	1.00	50.00	0.00	210015	2030-10-31	\N	ALCIMAR´S MEDIC	\N	\N	50.00
241	9	91	118	10.00	\N	2026-05-22 17:14:08.486781	1.00	1.00	10.00	0.00	20240620	2029-06-19	\N	ALCIMAR´S MEDIC	\N	\N	10.00
242	9	95	122	31.00	\N	2026-05-22 17:14:08.486781	1.00	1.00	31.00	0.00	20250418	2030-04-17	\N	ALCIMAR´S MEDIC	\N	\N	31.00
243	9	94	121	30.00	\N	2026-05-22 17:14:08.486781	1.00	1.00	30.00	0.00	212164	2030-02-28	\N	ALCIMAR´S MEDIC	\N	\N	30.00
244	9	93	120	30.00	\N	2026-05-22 17:14:08.486781	1.00	1.00	30.00	0.00	IN25008662	2030-07-01	\N	ALCIMAR´S MEDIC	\N	\N	30.00
245	9	92	119	10.00	\N	2026-05-22 17:14:08.486781	1.00	1.00	10.00	0.00	HE0325AM	2030-02-28	\N	ALCIMAR´S MEDIC	\N	\N	10.00
246	10	97	124	1.00	\N	2026-05-22 17:16:28.605482	1.00	1.00	1.00	0.00	G253	\N	\N	EDVAMEDICAL E.I.R.L.	\N	\N	1.00
247	11	102	129	1.00	\N	2026-05-22 17:23:05.139482	1.00	1.00	1.00	0.00	360124-M24912370023	\N	\N	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	\N	\N	1.00
248	11	102	130	1.00	\N	2026-05-22 17:23:05.139482	1.00	1.00	1.00	0.00	360124-M25410060001	\N	\N	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	\N	\N	1.00
252	15	103	131	1.00	\N	2026-05-22 17:29:35.012756	1.00	1.00	1.00	0.00	361527- M25C10210005	\N	\N	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	\N	\N	1.00
253	16	106	134	1.00	\N	2026-05-22 17:31:09.613972	1.00	1.00	1.00	0.00	360080-M25520140001	\N	\N	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	\N	\N	1.00
254	17	107	135	2.00	\N	2026-05-22 17:33:26.953266	1.00	1.00	2.00	0.00	2025081551	2027-08-14	\N	ANDINA MEDICA FILIAL PERU	\N	\N	2.00
255	18	108	136	4.00	\N	2026-05-22 17:34:46.675756	1.00	1.00	4.00	0.00	2025081451	2027-08-13	\N	ANDINA MEDICA FILIAL PERU	\N	\N	4.00
257	20	104	132	3.00	\N	2026-05-22 17:39:25.688242	1.00	1.00	3.00	0.00	AAVLK09EX	2027-08-02	\N	RAPIDIAGNOSTICS S.A.C.	\N	\N	3.00
258	21	105	133	3.00	\N	2026-05-22 17:40:24.186056	1.00	1.00	3.00	0.00	MAVFH04EX	2027-02-10	\N	RAPIDIAGNOSTICS S.A.C.	\N	\N	3.00
262	25	109	137	498.00	\N	2026-05-22 19:51:40.686306	1.00	1.00	500.00	0.00	20260225J1	2028-02-24	\N	Xi'an Tianguangyuan Biotech Co.,Ltd.	\N	\N	498.00
263	26	325	138	1.00	\N	2026-05-22 20:43:43.348421	1.00	1.00	1.00	0.00	SN-560435M25308290001	\N	\N	EDAN INSTRUMENTS INC	\N	\N	1.00
264	27	327	140	1000.00	\N	2026-05-22 21:21:54.065481	1.00	1.00	1000.00	0.00	2103144	2027-10-31	\N	COBEFAR S.A.C.	\N	\N	1000.00
265	27	326	139	500.00	\N	2026-05-22 21:21:54.065481	1.00	1.00	500.00	0.00	2040355	2028-04-30	\N	COBEFAR S.A.C.	\N	\N	500.00
249	12	101	128	35.00	\N	2026-05-22 17:25:18.977672	1.00	1.00	50.00	0.00	202507V	2030-07-31	\N	FERVAL BABY SAC	\N	\N	35.00
250	13	101	128	3.00	\N	2026-05-22 17:26:35.69029	1.00	1.00	50.00	0.00	202507V	2030-07-31	\N	FERVAL BABY SAC	\N	\N	3.00
251	14	101	128	1.00	\N	2026-05-22 17:28:04.298217	1.00	1.00	50.00	0.00	202507V	2030-07-31	\N	FERVAL BABY SAC	\N	\N	1.00
256	19	101	128	15.00	\N	2026-05-22 17:37:38.322872	1.00	1.00	50.00	0.00	202507V	2030-07-31	\N	FERVAL BABY SAC	\N	\N	15.00
259	22	101	128	14.00	\N	2026-05-22 17:42:23.818903	1.00	1.00	50.00	0.00	202507V	2030-07-31	\N	FERVAL BABY SAC	\N	\N	14.00
260	23	101	128	20.00	\N	2026-05-22 17:43:30.560051	1.00	1.00	50.00	0.00	202507V	2030-07-31	\N	FERVAL BABY SAC	\N	\N	20.00
266	28	9	383	20.00	\N	2026-05-27 21:11:41.72801	1.00	1.00	20.00	0.00	SP1125121506	2028-12-23	\N	JOSSON MEDICAL EIRL	\N	\N	20.00
267	28	5	384	5.00	\N	2026-05-27 21:11:41.72801	1.00	1.00	5.00	0.00	SP5324121808	2027-12-18	\N	JOSSON MEDICAL EIRL	\N	\N	5.00
268	28	45	385	10.00	\N	2026-05-27 21:11:41.72801	1.00	1.00	10.00	0.00	2511114218	2028-11-10	\N	JOSSON MEDICAL EIRL	\N	\N	10.00
269	28	46	386	10.00	\N	2026-05-27 21:11:41.72801	1.00	1.00	10.00	0.00	2506106166	2028-06-09	\N	JOSSON MEDICAL EIRL	\N	\N	10.00
270	28	4	387	1.00	\N	2026-05-27 21:11:41.72801	1.00	1.00	1.00	0.00	SP5325022829	2028-03-02	\N	JOSSON MEDICAL EIRL	\N	\N	1.00
271	28	4	388	5.00	\N	2026-05-27 21:11:41.72801	1.00	1.00	5.00	0.00	SP5325082210	2028-08-23	\N	JOSSON MEDICAL EIRL	\N	\N	5.00
272	29	7	10	5.00	\N	2026-05-28 17:00:08.378481	1.00	1.00	2.00	0.00	SP4125051505	2028-05-18	\N	JOSSON MEDICAL EIRL	\N	\N	5.00
273	29	8	11	2.00	\N	2026-05-28 17:00:08.378481	1.00	1.00	2.00	0.00	SP4124040324	2027-04-07	\N	JOSSON MEDICAL EIRL	\N	\N	2.00
274	29	10	13	3.00	\N	2026-05-28 17:00:08.378481	1.00	1.00	3.00	0.00	SP4125080402	2028-08-05	\N	JOSSON MEDICAL EIRL	\N	\N	3.00
275	29	4	4	12.00	\N	2026-05-28 17:00:08.378481	1.00	1.00	10.00	0.00	SP5324050510	2027-05-06	\N	JOSSON MEDICAL EIRL	\N	\N	12.00
276	30	4	9	23.00	\N	2026-05-28 17:02:29.627232	1.00	1.00	8.00	0.00	SP5325022823	2028-03-02	\N	JOSSON MEDICAL EIRL	\N	\N	23.00
277	30	6	7	40.00	\N	2026-05-28 17:02:29.627232	1.00	1.00	15.00	0.00	SP1124041531	2027-06-30	\N	JOSSON MEDICAL EIRL	\N	\N	40.00
278	30	6	8	15.00	\N	2026-05-28 17:02:29.627232	1.00	1.00	15.00	0.00	SP1124052316	2027-06-18	\N	JOSSON MEDICAL EIRL	\N	\N	15.00
279	31	5	5	15.00	\N	2026-05-28 17:04:47.523325	1.00	1.00	5.00	0.00	SP5324091912	2027-09-19	\N	JOSSON MEDICAL EIRL	\N	\N	15.00
280	31	9	12	10.00	\N	2026-05-28 17:04:47.523325	1.00	1.00	10.00	0.00	SP1124092024	2027-10-07	\N	JOSSON MEDICAL EIRL	\N	\N	10.00
281	31	6	6	5.00	\N	2026-05-28 17:04:47.523325	1.00	1.00	5.00	0.00	SP1124041023	2027-04-14	\N	JOSSON MEDICAL EIRL	\N	\N	5.00
282	32	208	239	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062019	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
283	32	199	230	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062010	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
284	32	215	246	8.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	8.00	0.00	SM0612-062026	\N	\N	SUNMED INSTRUMENTS	\N	\N	8.00
285	32	227	258	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062038	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
286	32	231	262	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062042	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
287	32	238	269	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062049	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
288	32	245	276	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062057	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
289	32	247	278	7.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	7.00	0.00	SM0612-062059	\N	\N	SUNMED INSTRUMENTS	\N	\N	7.00
290	32	248	279	8.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	8.00	0.00	SM0612-062060	\N	\N	SUNMED INSTRUMENTS	\N	\N	8.00
291	32	250	281	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062061	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
292	32	251	282	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062062	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
293	32	265	323	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062401	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
294	32	267	325	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062403	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
295	32	268	326	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062404	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
296	32	273	331	7.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	7.00	0.00	SM0612-062409	\N	\N	SUNMED INSTRUMENTS	\N	\N	7.00
297	32	304	362	16.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	16.00	0.00	SM0612-062441	\N	\N	SUNMED INSTRUMENTS	\N	\N	16.00
298	32	310	368	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062447	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
299	32	311	369	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062448	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
300	32	312	370	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062449	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
301	32	313	371	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062450	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
302	32	314	372	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062451	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
303	32	315	373	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062452	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
304	32	316	374	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062453	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
305	32	317	375	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062454	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
306	32	318	376	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062455	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
307	32	239	270	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062051	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
308	32	256	287	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062101	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
309	32	257	288	10.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	10.00	0.00	SM0612-062102	\N	\N	SUNMED INSTRUMENTS	\N	\N	10.00
310	32	262	293	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062107	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
311	32	263	294	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062108	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
312	32	264	295	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062109	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
313	32	331	299	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062113	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
314	32	332	300	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062114	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
315	32	334	302	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062116	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
316	32	335	303	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062117	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
317	32	336	304	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062118	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
318	32	337	305	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062119	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
319	32	339	307	10.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	10.00	0.00	SM0612-062121	\N	\N	SUNMED INSTRUMENTS	\N	\N	10.00
320	32	340	308	10.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	10.00	0.00	SM0612-062122	\N	\N	SUNMED INSTRUMENTS	\N	\N	10.00
321	32	348	316	8.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	8.00	0.00	SM0612-062130	\N	\N	SUNMED INSTRUMENTS	\N	\N	8.00
322	32	349	317	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062131	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
323	32	157	188	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062349	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
324	32	204	235	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062015	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
325	32	207	238	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062018	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
326	32	215	246	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062026	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
327	32	216	247	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062027	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
328	32	218	249	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062029	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
329	32	225	256	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062036	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
330	32	227	258	13.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	13.00	0.00	SM0612-062038	\N	\N	SUNMED INSTRUMENTS	\N	\N	13.00
331	32	232	263	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062043	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
332	32	233	264	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062044	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
333	32	245	276	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062057	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
334	32	246	277	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062058	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
335	32	247	278	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062059	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
336	32	248	279	9.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	9.00	0.00	SM0612-062060	\N	\N	SUNMED INSTRUMENTS	\N	\N	9.00
337	32	256	287	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062101	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
338	32	257	288	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062102	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
339	32	262	293	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062107	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
340	32	263	294	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062108	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
341	32	264	295	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062109	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
342	32	331	299	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062113	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
343	32	332	300	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062114	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
344	32	334	302	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062116	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
345	32	335	303	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062117	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
346	32	336	304	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062118	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
347	32	337	305	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062119	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
348	32	339	307	10.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	10.00	0.00	SM0612-062121	\N	\N	SUNMED INSTRUMENTS	\N	\N	10.00
349	32	344	312	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062126	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
350	32	345	313	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062127	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
351	32	346	314	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062128	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
352	32	347	315	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062129	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
353	32	348	316	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062130	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
354	32	349	317	9.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	9.00	0.00	SM0612-062131	\N	\N	SUNMED INSTRUMENTS	\N	\N	9.00
355	32	266	324	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062402	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
356	32	269	327	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062405	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
357	32	302	360	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062439	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
358	32	303	361	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062440	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
359	32	304	362	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062441	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
360	32	305	363	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062442	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
361	32	309	367	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062446	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
362	32	310	368	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062447	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
363	32	311	369	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062448	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
364	32	312	370	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062449	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
365	32	313	371	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062450	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
366	32	314	372	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062451	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
367	32	315	373	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062452	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
368	32	316	374	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062453	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
369	32	317	375	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062454	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
370	32	319	377	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062456	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
371	32	320	378	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062457	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
372	32	321	379	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062461	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
373	32	161	192	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062201	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
374	32	162	193	23.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	23.00	0.00	SM0612-062202	\N	\N	SUNMED INSTRUMENTS	\N	\N	23.00
375	32	163	194	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062203	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
376	32	164	195	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062204	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
377	32	165	196	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062205	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
378	32	166	197	30.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	30.00	0.00	SM0612-062206	\N	\N	SUNMED INSTRUMENTS	\N	\N	30.00
379	32	167	198	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062207	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
380	32	168	199	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062208	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
381	32	169	200	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062209	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
382	32	170	201	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062210	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
383	32	171	202	8.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	8.00	0.00	SM0612-062211	\N	\N	SUNMED INSTRUMENTS	\N	\N	8.00
384	32	172	203	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062212	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
385	32	173	204	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062213	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
386	32	174	205	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062214	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
387	32	175	206	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062215	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
388	32	176	207	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062216	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
389	32	177	208	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062217	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
390	32	178	209	42.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	42.00	0.00	SM0612-062218	\N	\N	SUNMED INSTRUMENTS	\N	\N	42.00
391	32	179	210	42.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	42.00	0.00	SM0612-062219	\N	\N	SUNMED INSTRUMENTS	\N	\N	42.00
392	32	180	211	42.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	42.00	0.00	SM0612-062220	\N	\N	SUNMED INSTRUMENTS	\N	\N	42.00
393	32	265	323	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062401	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
394	32	266	324	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062402	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
395	32	268	326	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062404	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
396	32	270	328	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062406	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
397	32	272	330	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062408	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
398	32	273	331	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062409	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
399	32	290	348	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062426	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
400	32	303	361	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062440	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
401	32	304	362	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062441	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
402	32	305	363	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062442	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
403	32	306	364	50.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	50.00	0.00	SM0612-062443	\N	\N	SUNMED INSTRUMENTS	\N	\N	50.00
404	32	307	365	50.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	50.00	0.00	SM0612-062444	\N	\N	SUNMED INSTRUMENTS	\N	\N	50.00
405	32	308	366	50.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	50.00	0.00	SM0612-062445	\N	\N	SUNMED INSTRUMENTS	\N	\N	50.00
406	32	309	367	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062446	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
407	32	314	372	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062451	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
408	32	317	375	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062454	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
409	32	318	376	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062455	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
410	32	322	380	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062458	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
411	32	323	381	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062459	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
412	32	324	382	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062460	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
413	32	181	212	42.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	42.00	0.00	SM0612-062221	\N	\N	SUNMED INSTRUMENTS	\N	\N	42.00
414	32	182	213	42.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	42.00	0.00	SM0612-062222	\N	\N	SUNMED INSTRUMENTS	\N	\N	42.00
415	32	183	214	42.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	42.00	0.00	SM0612-062223	\N	\N	SUNMED INSTRUMENTS	\N	\N	42.00
416	32	184	215	42.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	42.00	0.00	SM0612-062224	\N	\N	SUNMED INSTRUMENTS	\N	\N	42.00
417	32	185	216	42.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	42.00	0.00	SM0612-062225	\N	\N	SUNMED INSTRUMENTS	\N	\N	42.00
418	32	186	217	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062226	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
419	32	187	218	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062227	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
420	32	188	219	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062228	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
421	32	189	220	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062229	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
422	32	110	141	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062301	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
423	32	111	142	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062302	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
424	32	257	288	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062102	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
425	32	258	289	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062103	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
426	32	191	222	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062002	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
427	32	192	223	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062003	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
428	32	259	290	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062104	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
429	32	260	291	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062105	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
430	32	261	292	13.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	13.00	0.00	SM0612-062106	\N	\N	SUNMED INSTRUMENTS	\N	\N	13.00
431	32	262	293	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062107	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
432	32	263	294	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062108	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
433	32	264	295	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062109	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
434	32	328	296	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062110	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
435	32	329	297	42.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	42.00	0.00	SM0612-062111	\N	\N	SUNMED INSTRUMENTS	\N	\N	42.00
436	32	330	298	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062112	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
437	32	331	299	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062113	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
438	32	332	300	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062114	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
439	32	333	301	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062115	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
440	32	335	303	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062117	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
441	32	336	304	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062118	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
442	32	337	305	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062119	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
443	32	338	306	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062120	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
444	32	339	307	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062121	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
445	32	340	308	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062122	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
446	32	341	309	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062123	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
447	32	342	310	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062124	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
448	32	112	143	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062303	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
449	32	113	144	10.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	10.00	0.00	SM0612-062304	\N	\N	SUNMED INSTRUMENTS	\N	\N	10.00
450	32	114	145	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062305	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
451	32	115	146	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062306	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
452	32	116	147	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062307	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
453	32	117	148	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062308	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
454	32	118	149	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062309	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
455	32	119	150	25.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	25.00	0.00	SM0612-062310	\N	\N	SUNMED INSTRUMENTS	\N	\N	25.00
456	32	120	151	25.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	25.00	0.00	SM0612-062311	\N	\N	SUNMED INSTRUMENTS	\N	\N	25.00
457	32	121	152	30.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	30.00	0.00	SM0612-062312	\N	\N	SUNMED INSTRUMENTS	\N	\N	30.00
458	32	122	153	36.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	36.00	0.00	SM0612-062313	\N	\N	SUNMED INSTRUMENTS	\N	\N	36.00
459	32	123	154	30.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	30.00	0.00	SM0612-062314	\N	\N	SUNMED INSTRUMENTS	\N	\N	30.00
460	32	124	155	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062315	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
461	32	125	156	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062316	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
462	32	343	311	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062125	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
463	32	344	312	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062126	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
464	32	346	314	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062128	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
465	32	347	315	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062129	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
466	32	348	316	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062130	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
467	32	349	317	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062131	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
468	32	350	318	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062132	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
469	32	351	319	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062133	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
470	32	352	320	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062134	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
471	32	353	321	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062135	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
472	32	354	322	48.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	48.00	0.00	SM0612-062136	\N	\N	SUNMED INSTRUMENTS	\N	\N	48.00
473	32	190	221	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062001	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
474	32	193	224	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062004	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
475	32	194	225	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062005	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
476	32	195	226	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062006	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
477	32	209	240	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062020	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
478	32	210	241	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062021	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
479	32	211	242	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062022	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
480	32	126	157	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062317	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
481	32	127	158	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062318	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
482	32	128	159	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062319	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
483	32	129	160	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062320	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
484	32	130	161	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062321	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
485	32	131	162	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062322	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
486	32	132	163	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062323	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
487	32	133	164	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062324	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
488	32	134	165	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062325	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
489	32	135	166	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062326	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
490	32	196	227	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062007	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
491	32	197	228	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062008	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
492	32	198	229	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062009	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
493	32	201	232	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062012	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
494	32	202	233	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062013	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
495	32	203	234	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062014	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
496	32	204	235	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062015	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
497	32	160	191	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062352	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
498	32	206	237	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062017	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
499	32	207	238	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062018	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
500	32	215	246	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062026	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
501	32	216	247	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062027	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
502	32	220	251	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062031	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
503	32	232	263	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062043	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
504	32	233	264	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062044	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
505	32	239	270	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062051	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
506	32	242	273	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062054	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
507	32	246	277	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062058	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
508	32	255	286	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062066	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
509	32	136	167	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062327	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
510	32	137	168	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062328	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
511	32	138	169	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062329	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
512	32	139	170	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062330	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
513	32	140	171	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062331	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
514	32	141	172	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062332	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
515	32	142	173	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062333	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
516	32	143	174	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062334	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
517	32	144	175	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062335	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
518	32	221	252	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062032	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
519	32	222	253	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062033	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
520	32	223	254	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062034	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
521	32	227	258	13.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	13.00	0.00	SM0612-062038	\N	\N	SUNMED INSTRUMENTS	\N	\N	13.00
522	32	228	259	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062039	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
523	32	234	265	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062045	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
524	32	235	266	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062046	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
525	32	236	267	11.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	11.00	0.00	SM0612-062047	\N	\N	SUNMED INSTRUMENTS	\N	\N	11.00
526	32	237	268	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062048	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
527	32	145	176	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062336	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
528	32	146	177	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062337	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
529	32	147	178	10.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	10.00	0.00	SM0612-062338	\N	\N	SUNMED INSTRUMENTS	\N	\N	10.00
530	32	148	179	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062339	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
531	32	149	180	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062340	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
532	32	150	181	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062341	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
533	32	151	182	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062342	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
534	32	152	183	18.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	18.00	0.00	SM0612-062344	\N	\N	SUNMED INSTRUMENTS	\N	\N	18.00
535	32	153	184	19.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	19.00	0.00	SM0612-062345	\N	\N	SUNMED INSTRUMENTS	\N	\N	19.00
536	32	154	185	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062346	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
537	32	155	186	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062347	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
538	32	156	187	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062348	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
539	32	157	188	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062349	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
540	32	158	189	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062350	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
541	32	159	190	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062351	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
542	32	214	245	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062025	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
543	32	218	249	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062029	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
544	32	224	255	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062035	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
545	32	226	257	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062037	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
546	32	240	271	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062052	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
547	32	241	272	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062053	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
548	32	243	274	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062055	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
549	32	244	275	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062056	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
550	32	245	276	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062057	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
551	32	247	278	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062059	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
552	32	248	279	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062060	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
553	32	249	280	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062067	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
554	32	250	281	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062061	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
555	32	252	283	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062063	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
556	32	254	285	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062065	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
557	32	113	144	15.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	15.00	0.00	SM0612-062304	\N	\N	SUNMED INSTRUMENTS	\N	\N	15.00
558	32	157	188	9.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	9.00	0.00	SM0612-062349	\N	\N	SUNMED INSTRUMENTS	\N	\N	9.00
559	32	162	193	1.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	1.00	0.00	SM0612-062202	\N	\N	SUNMED INSTRUMENTS	\N	\N	1.00
560	32	200	231	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062011	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
561	32	205	236	12.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	12.00	0.00	SM0612-062016	\N	\N	SUNMED INSTRUMENTS	\N	\N	12.00
562	32	206	237	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062017	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
563	32	207	238	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062018	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
564	32	208	239	8.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	8.00	0.00	SM0612-062019	\N	\N	SUNMED INSTRUMENTS	\N	\N	8.00
565	32	212	243	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062023	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
566	32	213	244	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062024	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
567	32	215	246	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062026	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
568	32	217	248	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062028	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
569	32	218	249	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062029	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
570	32	219	250	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062030	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
571	32	220	251	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062031	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
572	32	227	258	10.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	10.00	0.00	SM0612-062038	\N	\N	SUNMED INSTRUMENTS	\N	\N	10.00
573	32	231	262	10.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	10.00	0.00	SM0612-062042	\N	\N	SUNMED INSTRUMENTS	\N	\N	10.00
574	32	241	272	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062053	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
575	32	242	273	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062054	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
576	32	245	276	7.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	7.00	0.00	SM0612-062057	\N	\N	SUNMED INSTRUMENTS	\N	\N	7.00
577	32	246	277	9.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	9.00	0.00	SM0612-062058	\N	\N	SUNMED INSTRUMENTS	\N	\N	9.00
578	32	248	279	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062060	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
579	32	328	296	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062110	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
580	32	339	307	24.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	24.00	0.00	SM0612-062121	\N	\N	SUNMED INSTRUMENTS	\N	\N	24.00
581	32	340	308	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062122	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
582	32	345	313	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062127	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
583	32	346	314	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062128	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
584	32	347	315	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062129	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
585	32	353	321	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062135	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
586	32	266	324	4.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	4.00	0.00	SM0612-062402	\N	\N	SUNMED INSTRUMENTS	\N	\N	4.00
587	32	270	328	11.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	11.00	0.00	SM0612-062406	\N	\N	SUNMED INSTRUMENTS	\N	\N	11.00
588	32	275	333	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062411	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
589	32	278	336	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062414	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
590	32	280	338	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062416	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
591	32	293	351	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062429	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
592	32	301	359	6.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	6.00	0.00	SM0612-062438	\N	\N	SUNMED INSTRUMENTS	\N	\N	6.00
593	32	304	362	2.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	2.00	0.00	SM0612-062441	\N	\N	SUNMED INSTRUMENTS	\N	\N	2.00
594	32	305	363	10.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	10.00	0.00	SM0612-062442	\N	\N	SUNMED INSTRUMENTS	\N	\N	10.00
595	32	309	367	5.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	5.00	0.00	SM0612-062446	\N	\N	SUNMED INSTRUMENTS	\N	\N	5.00
596	32	319	377	3.00	\N	2026-05-29 17:54:09.351306	1.00	1.00	3.00	0.00	SM0612-062456	\N	\N	SUNMED INSTRUMENTS	\N	\N	3.00
597	33	574	842	2.00	\N	2026-06-01 20:59:06.41841	1.00	1.00	2.00	0.00	F22B123C2	2029-12-03	\N	JAMPAR S.A.C.	\N	\N	2.00
598	34	575	843	2.00	\N	2026-06-01 21:18:23.88643	1.00	1.00	2.00	0.00	2025111701	2027-11-16	\N	LC BIOCORP S.A.C.	\N	\N	2.00
599	34	576	844	4.00	\N	2026-06-01 21:18:23.88643	1.00	1.00	4.00	0.00	2025090101	2027-08-31	\N	LC BIOCORP S.A.C.	\N	\N	4.00
600	34	577	845	4.00	\N	2026-06-01 21:18:23.88643	1.00	1.00	4.00	0.00	2025112201	2027-11-21	\N	LC BIOCORP S.A.C.	\N	\N	4.00
601	35	578	846	2.00	\N	2026-06-01 21:58:22.640255	1.00	1.00	2.00	0.00	2025111701	2027-11-16	\N	LC BIOCORP S.A.C.	\N	\N	2.00
602	36	579	847	5.00	\N	2026-06-01 22:02:58.227354	1.00	1.00	5.00	0.00	2024101702	2026-10-16	\N	LC BIOCORP S.A.C.	\N	\N	5.00
603	37	583	853	5.00	\N	2026-06-04 21:47:41.168864	1.00	1.00	5.00	0.00	4100272	2026-09-30	\N	CARDIO PERFUSION E.I.R.L	\N	\N	5.00
604	37	584	854	8.00	\N	2026-06-04 21:47:41.168864	1.00	1.00	8.00	0.00	I3455577	2029-02-26	\N	CARDIO PERFUSION E.I.R.L	\N	\N	8.00
605	37	42	851	10.00	\N	2026-06-04 21:47:41.168864	1.00	1.00	1.00	0.00	K3371732	2028-10-24	\N	CARDIO PERFUSION E.I.R.L	\N	\N	10.00
606	37	43	852	20.00	\N	2026-06-04 21:47:41.168864	1.00	1.00	1.00	0.00	K3396584	2028-11-22	\N	CARDIO PERFUSION E.I.R.L	\N	\N	20.00
607	38	765	863	1.00	\N	2026-06-11 21:13:56.04266	1.00	1.00	1.00	0.00	560038-M25910830007	\N	\N	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C	\N	\N	1.00
608	38	764	862	1.00	\N	2026-06-11 21:13:56.04266	1.00	1.00	1.00	0.00	13500000002507024827	\N	\N	TARRILLO BARBA S.A.	\N	\N	1.00
609	38	763	861	1.00	\N	2026-06-11 21:13:56.04266	1.00	1.00	1.00	0.00	13500000002507024826	\N	\N	TARRILLO BARBA S.A.	\N	\N	1.00
610	38	762	860	1.00	\N	2026-06-11 21:13:56.04266	1.00	1.00	1.00	0.00	13500000002507024825	\N	\N	TARRILLO BARBA S.A.	\N	\N	1.00
611	38	761	859	1.00	\N	2026-06-11 21:13:56.04266	1.00	1.00	1.00	0.00	13500000002507024824	\N	\N	TARRILLO BARBA S.A.	\N	\N	1.00
612	38	760	858	1.00	\N	2026-06-11 21:13:56.04266	1.00	1.00	1.00	0.00	13500000002507024823	\N	\N	TARRILLO BARBA S.A.	\N	\N	1.00
613	38	759	857	1.00	\N	2026-06-11 21:13:56.04266	1.00	1.00	1.00	0.00	13500000002507024822	\N	\N	TARRILLO BARBA S.A.	\N	\N	1.00
614	38	758	856	1.00	\N	2026-06-11 21:13:56.04266	1.00	1.00	1.00	0.00	13500000002507024821	\N	\N	TARRILLO BARBA S.A.	\N	\N	1.00
615	38	757	855	1.00	\N	2026-06-11 21:13:56.04266	1.00	1.00	1.00	0.00	13500000002507024820	\N	\N	TARRILLO BARBA S.A.	\N	\N	1.00
616	39	104	864	5.00	\N	2026-06-11 21:16:11.028328	1.00	1.00	5.00	0.00	AAWAN11EX	2027-09-21	\N	RAPIDIAGNOSTICS S.A.C.	\N	\N	5.00
617	39	105	865	5.00	\N	2026-06-11 21:16:11.028328	1.00	1.00	5.00	0.00	MAVLX03EX	2027-08-17	\N	RAPIDIAGNOSTICS S.A.C.	\N	\N	5.00
618	40	766	866	1.00	\N	2026-06-11 21:22:26.778848	1.00	1.00	1.00	0.00	DFRVCA11	2026-11-09	\N	RAPIDIAGNOSTICS S.A.C.	\N	\N	1.00
619	40	775	876	19.00	\N	2026-06-11 21:22:26.778848	1.00	1.00	20.00	0.00	F0331X3F00D	2028-04-02	\N	CIA IMPORTADORA AMERICANA S.A.	\N	\N	19.00
620	41	767	867	20.00	\N	2026-06-11 21:31:35.905996	1.00	1.00	20.00	0.00	F1010W1E00D	2027-10-14	\N	CIA. IMPORTADORA AMERICANA S.A.	\N	\N	20.00
621	41	780	881	96.00	\N	2026-06-11 21:31:35.905996	1.00	1.00	96.00	0.00	1045824328	2027-08-31	\N	DIAGNOSTICA PERUANA S.A.C.	\N	\N	96.00
622	42	793	900	9.00	\N	2026-06-11 21:33:38.610396	1.00	1.00	9.00	0.00	504/25	2028-07-07	\N	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	\N	\N	9.00
623	42	794	901	9.00	\N	2026-06-11 21:33:38.610396	1.00	1.00	9.00	0.00	566/24	2027-06-27	\N	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	\N	\N	9.00
624	43	796	909	1.00	\N	2026-06-11 21:46:11.547325	1.00	1.00	1.00	0.00	0000072163	2028-05-02	\N	A. TARRILLO SA.	\N	\N	1.00
625	44	792	899	1.00	\N	2026-06-11 21:50:20.265373	1.00	1.00	1.00	0.00	784828	\N	\N	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	\N	\N	1.00
626	44	798	905	1.00	\N	2026-06-11 21:50:20.265373	1.00	1.00	1.00	0.00	MO14060356	\N	\N	DROGUERIA IMPORTADORA ANTONIO´S E.I.R.L.	\N	\N	1.00
629	46	788	895	1.00	\N	2026-06-11 21:59:42.18769	1.00	1.00	1.00	0.00	304190	2027-09-02	\N	CORPORACION LYACOS E.I.R.L	\N	\N	1.00
630	47	783	890	6.00	\N	2026-06-11 22:06:13.784224	1.00	1.00	6.00	0.00	H122	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	6.00
631	47	784	891	3.00	\N	2026-06-11 22:06:13.784224	1.00	1.00	3.00	0.00	G238	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	3.00
632	47	785	892	3.00	\N	2026-06-11 22:06:13.784224	1.00	1.00	3.00	0.00	AAB	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	3.00
633	47	769	884	3.00	\N	2026-06-11 22:06:13.784224	1.00	1.00	15.00	0.00	G185	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	3.00
634	47	772	888	3.00	\N	2026-06-11 22:06:13.784224	1.00	1.00	7.00	0.00	H129	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	3.00
635	47	786	893	3.00	\N	2026-06-11 22:06:13.784224	1.00	1.00	3.00	0.00	G185	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	3.00
636	47	770	886	3.00	\N	2026-06-11 22:06:13.784224	1.00	1.00	6.00	0.00	G222	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	3.00
637	47	768	882	3.00	\N	2026-06-11 22:06:13.784224	1.00	1.00	6.00	0.00	G291	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	3.00
638	48	101	128	1.00	\N	2026-06-12 19:48:29.676502	1.00	1.00	40.00	0.00	202507V	2030-07-31	\N	FERVAL BABY SAC	\N	\N	1.00
639	49	787	894	1.00	\N	2026-06-12 19:53:20.388098	1.00	1.00	1.00	0.00	407688	2027-07-08	\N	CORPORACION LYACOS E.I.R.L	\N	\N	1.00
640	49	799	906	1.00	\N	2026-06-12 19:53:20.388098	1.00	1.00	1.00	0.00	CR-3C275446	\N	\N	BIOMEDICAL CARE SYSTEMS S.A.C.	\N	\N	1.00
641	49	800	907	1.00	\N	2026-06-12 19:53:20.388098	1.00	1.00	1.00	0.00	CR-3C275447	\N	\N	BIOMEDICAL CARE SYSTEMS S.A.C.	\N	\N	1.00
642	49	101	128	2.00	\N	2026-06-12 19:53:20.388098	1.00	1.00	40.00	0.00	202507V	2030-07-31	\N	FERVAL BABY SAC	\N	\N	2.00
643	50	768	882	3.00	\N	2026-06-12 20:03:33.58986	1.00	1.00	6.00	0.00	G291	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	3.00
644	50	781	883	1.00	\N	2026-06-12 20:03:33.58986	1.00	1.00	1.00	0.00	G291	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	1.00
645	50	769	884	12.00	\N	2026-06-12 20:03:33.58986	1.00	1.00	15.00	0.00	G185	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	12.00
646	50	782	885	3.00	\N	2026-06-12 20:03:33.58986	1.00	1.00	3.00	0.00	G122	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	3.00
647	50	770	886	3.00	\N	2026-06-12 20:03:33.58986	1.00	1.00	6.00	0.00	G222	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	3.00
648	50	771	887	12.00	\N	2026-06-12 20:03:33.58986	1.00	1.00	12.00	0.00	D231	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	12.00
649	50	772	888	4.00	\N	2026-06-12 20:03:33.58986	1.00	1.00	7.00	0.00	H129	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	4.00
650	50	773	889	12.00	\N	2026-06-12 20:03:33.58986	1.00	1.00	12.00	0.00	H131	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	12.00
651	50	797	904	2.00	\N	2026-06-12 20:03:33.58986	1.00	1.00	2.00	0.00	MO14100167	\N	\N	DROGUERIA IMPORTADORA ANTONIO´S E.I.R.L.	\N	\N	2.00
652	51	768	868	1.00	\N	2026-06-12 20:09:12.707425	1.00	1.00	1.00	0.00	G222	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	1.00
653	51	769	869	2.00	\N	2026-06-12 20:09:12.707425	1.00	1.00	2.00	0.00	G185	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	2.00
654	51	770	870	2.00	\N	2026-06-12 20:09:12.707425	1.00	1.00	2.00	0.00	G222	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	2.00
655	51	771	871	2.00	\N	2026-06-12 20:09:12.707425	1.00	1.00	2.00	0.00	D231	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	2.00
656	51	774	874	1.00	\N	2026-06-12 20:09:12.707425	1.00	1.00	1.00	0.00	F229	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	1.00
657	51	774	875	1.00	\N	2026-06-12 20:09:12.707425	1.00	1.00	1.00	0.00	D129	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	1.00
658	51	773	873	2.00	\N	2026-06-12 20:09:12.707425	1.00	1.00	2.00	0.00	H121	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	2.00
659	51	776	877	10.00	\N	2026-06-12 20:09:12.707425	1.00	1.00	10.00	0.00	202503027	2030-08-31	\N	ALCIMAR'S MEDIC S.A.C.	\N	\N	10.00
660	51	772	872	2.00	\N	2026-06-12 20:09:12.707425	1.00	1.00	2.00	0.00	H129	\N	\N	EDVAMEDICAL E.I.R.L	\N	\N	2.00
661	52	777	878	1.00	\N	2026-06-12 20:17:20.965928	1.00	1.00	1.00	0.00	H25B00450463	\N	\N	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C.	\N	\N	1.00
662	53	778	879	1.00	\N	2026-06-12 20:24:25.622632	1.00	1.00	1.00	0.00	360101-M25C09810051	\N	\N	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C.	\N	\N	1.00
663	54	60	77	72.00	\N	2026-06-12 21:26:49.535622	1.00	1.00	72.00	0.00	241189400	\N	\N	SUAVINEX GROUP, S.L	\N	\N	72.00
664	54	52	65	99.00	\N	2026-06-12 21:26:49.535622	1.00	1.00	1404.00	0.00	2511090101	2029-11-24	\N	SUAVINEX GROUP, S.L	\N	\N	99.00
665	54	56	71	180.00	\N	2026-06-12 21:26:49.535622	1.00	1.00	1845.00	0.00	2510067901	2029-10-17	\N	SUAVINEX GROUP, S.L	\N	\N	180.00
666	54	77	98	30.00	\N	2026-06-12 21:26:49.535622	1.00	1.00	420.00	0.00	2511022701	2029-11-12	\N	SUAVINEX GROUP, S.L	\N	\N	30.00
667	54	76	97	16.00	\N	2026-06-12 21:26:49.535622	1.00	1.00	320.00	0.00	2506268201	2029-07-03	\N	SUAVINEX GROUP, S.L	\N	\N	16.00
668	54	62	80	16.00	\N	2026-06-12 21:26:49.535622	1.00	1.00	64.00	0.00	2403049101	2028-03-14	\N	SUAVINEX GROUP, S.L	\N	\N	16.00
669	55	58	75	54.00	\N	2026-06-12 21:38:00.451488	1.00	1.00	594.00	0.00	2511014801	\N	\N	SUAVINEX GROUP, S.L	\N	\N	54.00
670	56	848	1356	50.00	\N	2026-06-18 16:25:55.36302	1.00	1.00	100.00	0.00	RA4539	2027-10-31	\N	H REPS S.A.C.	\N	\N	50.00
230	7	873	\N	3.00	\N	2026-05-22 15:12:52.558649	1.00	1.00	3.00	0.00	2025255	2030-08-01	\N	EOMEDICA SAC	\N	\N	3.00
231	7	874	\N	2.00	\N	2026-05-22 15:12:52.558649	1.00	1.00	2.00	0.00	2601061	2031-01-25	\N	QINGDAO HIPROVE MEDICAL TECHNOLOGIES CO.,LTD	\N	\N	2.00
232	7	874	\N	2.00	\N	2026-05-22 15:12:52.558649	1.00	1.00	2.00	0.00	2601062	2031-01-25	\N	QINGDAO HIPROVE MEDICAL TECHNOLOGIES CO.,LTD	\N	\N	2.00
233	7	873	\N	2.00	\N	2026-05-22 15:12:52.558649	1.00	1.00	2.00	0.00	2025255	2030-08-01	\N	EOMEDICA SAC	\N	\N	2.00
234	7	873	\N	2.00	\N	2026-05-22 15:12:52.558649	1.00	1.00	2.00	0.00	2025255	2030-08-01	\N	EOMEDICA SAC	\N	\N	2.00
235	7	874	\N	2.00	\N	2026-05-22 15:12:52.558649	1.00	1.00	2.00	0.00	2601061	2031-01-25	\N	QINGDAO HIPROVE MEDICAL TECHNOLOGIES CO.,LTD	\N	\N	2.00
236	7	874	\N	2.00	\N	2026-05-22 15:12:52.558649	1.00	1.00	2.00	0.00	2601062	2031-01-25	\N	QINGDAO HIPROVE MEDICAL TECHNOLOGIES CO.,LTD	\N	\N	2.00
\.


--
-- Data for Name: notas_ingreso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notas_ingreso (id, numero_ingreso, fecha, proveedor, tipo_documento, numero_documento, responsable_id, estado, observaciones, created_at, updated_at, cliente_id, numero_guia, cliente_ruc) FROM stdin;
1	00000001	2025-08-26	AFECORP PERU S.A.C	\N	\N	1	REGISTRADA	\N	2026-05-21 06:48:17.996923	2026-05-21 06:48:17.996923	2	guia-0000001	20600124871
2	00000002	2026-03-27	HDM CAPITAL S.A.C.	\N	\N	1	REGISTRADA	\N	2026-05-21 18:15:35.017837	2026-05-21 18:15:35.017837	8	guia-0000002	20605390332
3	00000003	2026-02-03	IMPORTACIONES MEDICAS RZ S.A.C.	\N	\N	1	REGISTRADA	\N	2026-05-22 15:04:48.568127	2026-05-22 15:04:48.568127	6	guia-0000003	20610696571
4	00000004	2026-02-20	JR MEDIC E.I.R.L.	\N	\N	1	REGISTRADA	\N	2026-05-22 17:04:10.870925	2026-05-22 17:04:10.870925	9	guia-0000004	20613045440
5	00000005	2026-04-08	SALUDBOOST S.A.C.	Invoice	XATGY260203J1	1	REGISTRADA	\N	2026-05-22 19:39:58.723865	2026-05-22 19:39:58.723865	13	guia-0000005	20611918152
6	00000006	2025-10-31	SUNIX MEDICAL S.A.C.	Guía de Remisión Remitente	EG07-00000008	1	REGISTRADA	\N	2026-05-22 20:37:59.194105	2026-05-22 20:37:59.194105	4	guia-0000006	20612226211
7	00000007	2026-03-24	LINEAGE	Guía de Remisión Remitente	T005-00148820	1	REGISTRADA	\N	2026-05-22 21:14:37.008465	2026-05-22 21:14:37.008465	7	guia-0000007	20613906895
8	00000008	2026-03-24	LINEAGE	Guía de Remisión Remitente	T005-00148821	1	REGISTRADA	\N	2026-05-22 21:19:09.526797	2026-05-22 21:19:09.526797	7	guia-0000008	20613906895
9	00000009	2025-06-24	SUMEDIN S.A.C.	\N	\N	1	REGISTRADA	\N	2026-05-26 00:23:00.590089	2026-05-26 00:23:00.590089	1	guia-0000009	20608438018
10	00000010	2026-05-19	AFECORP PERU S.A.C	Guía de Remisión Remitente	T001-00003967	1	REGISTRADA	\N	2026-05-27 20:44:48.616357	2026-05-27 20:44:48.616357	2	guia-0000010	20600124871
12	00000012	2026-03-27	LINEAGE	Guía de Remisión Remitente	T001-00007002	1	REGISTRADA	\N	2026-06-01 20:56:22.3506	2026-06-01 20:56:22.3506	7	guia-0000012	20613906895
13	00000013	2026-04-24	LINEAGE	Guía de Remisión Remitente	T004-00000698	1	REGISTRADA	\N	2026-06-01 21:09:26.680791	2026-06-01 21:09:26.680791	7	guia-0000013	20613906895
14	00000014	2026-04-28	LINEAGE	Guía de Remisión Remitente	T004-00000752	1	REGISTRADA	\N	2026-06-01 21:27:30.584682	2026-06-01 21:27:30.584682	7	guia-0000014	20613906895
15	00000015	2026-05-05	LINEAGE	Guía de Remisión Remitente	T004-00000794	1	REGISTRADA	\N	2026-06-01 22:01:27.037312	2026-06-01 22:01:27.037312	7	guia-0000015	20613906895
16	00000016	2026-05-26	LINEAGE	Guía de Remisión Remitente	T001-00075176	1	REGISTRADA	\N	2026-06-02 15:21:20.165941	2026-06-02 15:21:20.165941	7	guia-0000016	20613906895
18	00000017	2026-05-26	LINEAGE	Guía de Remisión Remitente	T004-00001024	1	REGISTRADA	\N	2026-06-02 15:40:53.240312	2026-06-02 15:40:53.240312	7	guia-0000017	20613906895
19	00000018	2026-05-26	AFECORP PERU S.A.C	Guía de Remisión Remitente	TL01-00027928	1	REGISTRADA	\N	2026-06-02 17:33:01.643082	2026-06-02 17:33:01.643082	2	guia-0000018	20600124871
20	00000019	2026-05-26	AFECORP PERU S.A.C	Guía de Remisión Remitente	TM01-00019251	1	REGISTRADA	\N	2026-06-02 21:45:11.652616	2026-06-02 21:45:11.652616	2	guia-0000019	20600124871
21	00000020	2026-04-20	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000030	1	REGISTRADA	\N	2026-06-10 15:28:56.24014	2026-06-10 15:28:56.24014	9	guia-0000020	20613045440
22	00000021	2026-04-23	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003311	1	REGISTRADA	\N	2026-06-10 16:43:16.751961	2026-06-10 16:43:16.751961	9	guia-0000021	20613045440
23	00000022	2026-04-24	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-19881	1	REGISTRADA	\N	2026-06-10 16:52:13.68057	2026-06-10 16:52:13.68057	9	guia-0000022	20613045440
24	00000023	2026-05-04	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00011722	1	REGISTRADA	\N	2026-06-10 17:59:42.257729	2026-06-10 17:59:42.257729	9	guia-0000023	20613045440
25	00000024	2026-05-06	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-003456	1	REGISTRADA	\N	2026-06-10 18:30:57.695335	2026-06-10 18:30:57.695335	9	guia-0000024	20613045440
26	00000025	2026-05-11	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00011819	1	REGISTRADA	\N	2026-06-10 20:14:49.390947	2026-06-10 20:14:49.390947	9	guia-0000025	20613045440
27	00000026	2026-05-12	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00074329	1	REGISTRADA	\N	2026-06-10 20:23:32.168744	2026-06-10 20:23:32.168744	9	guia-0000026	20613045440
28	00000027	2026-05-12	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003398	1	REGISTRADA	\N	2026-06-10 20:32:08.783673	2026-06-10 20:32:08.783673	9	guia-0000027	20613045440
29	00000028	2026-05-15	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	TG01-007443	1	REGISTRADA	\N	2026-06-10 20:41:25.305129	2026-06-10 20:41:25.305129	9	guia-0000028	20613045440
30	00000029	2026-05-13	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00046280	1	REGISTRADA	\N	2026-06-10 21:05:23.498032	2026-06-10 21:05:23.498032	9	guia-0000029	20613045440
31	00000030	2026-05-14	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003503	1	REGISTRADA	\N	2026-06-10 21:17:07.180123	2026-06-10 21:17:07.180123	9	guia-0000030	20613045440
32	00000031	2026-05-14	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	TTT2-003176	1	REGISTRADA	\N	2026-06-10 21:35:21.625374	2026-06-10 21:35:21.625374	9	guia-0000031	20613045440
34	00000032	2026-05-14	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T025-0003071	1	REGISTRADA	\N	2026-06-11 15:32:06.363193	2026-06-11 15:32:06.363193	9	guia-0000032	20613045440
36	00000034	2026-05-15	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000045	1	REGISTRADA	\N	2026-06-11 19:44:50.177638	2026-06-11 19:44:50.177638	9	guia-0000034	20613045440
37	00000035	2026-05-21	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	EG07-00001989	1	REGISTRADA	\N	2026-06-11 20:05:38.266809	2026-06-11 20:05:38.266809	9	guia-0000035	20613045440
38	00000036	2026-05-21	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T004-00000108	1	REGISTRADA	\N	2026-06-11 20:13:30.581808	2026-06-11 20:13:30.581808	9	guia-0000036	20613045440
35	00000033	2026-05-15	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000044	1	REGISTRADA	Documento: 00000033	2026-06-11 15:56:18.599102	2026-06-11 21:39:11.381521	9	guia-0000033	20613045440
39	00000037	2025-10-21	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	1	REGISTRADA	\N	2026-06-17 21:48:43.619236	2026-06-17 21:48:43.619236	3	guia-0000037	20605712241
40	00000038	2026-06-08	\t GLOBAL DRUG PERU S.A.C	Guía de Remisión Remitente	T001-23348	1	REGISTRADA	\N	2026-06-18 15:47:25.787293	2026-06-18 15:47:25.787293	14	guia-0000038	20607309478
41	00000039	2026-06-17	\t GLOBAL DRUG PERU S.A.C	Guía de Remisión Remitente	T104-00001426	1	REGISTRADA	\N	2026-06-18 16:20:01.718087	2026-06-18 16:20:01.718087	14	guia-0000039	20607309478
43	00000040	2026-06-06	MIRET MEDICAL ASOCIADOS S.A.C.	Invoice	PE0063220260515A	1	REGISTRADA	\N	2026-06-18 19:28:15.300949	2026-06-18 19:28:15.300949	3	guia-0000040	20605712241
44	00000041	2026-05-12	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T002-3068	1	REGISTRADA	\N	2026-06-18 20:06:31.062919	2026-06-18 20:06:31.062919	3	guia-0000041	20605712241
45	00000042	2026-05-28	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	EG07 - 00000075	1	REGISTRADA	\N	2026-06-18 20:21:20.075229	2026-06-18 20:21:20.075229	3	guia-0000042	20605712241
46	00000043	2026-06-01	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T002-3172	1	REGISTRADA	\N	2026-06-18 20:36:26.752392	2026-06-18 20:36:26.752392	3	guia-0000043	20605712241
47	00000044	2026-06-02	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T002-3168	1	REGISTRADA	\N	2026-06-18 20:47:47.484128	2026-06-18 20:47:47.484128	3	guia-0000044	20605712241
48	00000045	2026-06-02	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T006-00007287	1	REGISTRADA	\N	2026-06-18 21:17:00.009799	2026-06-18 21:17:00.009799	3	guia-0000045	20605712241
49	00000046	2026-06-03	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T002-3162	1	REGISTRADA	\N	2026-06-18 21:26:14.618097	2026-06-18 21:26:14.618097	3	guia-0000046	20605712241
50	00000047	2026-06-03	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T002-3176	1	REGISTRADA	\N	2026-06-18 21:36:37.42468	2026-06-18 21:36:37.42468	3	guia-0000047	20605712241
51	00000048	2026-06-05	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T001-00009595	1	REGISTRADA	\N	2026-06-18 21:45:17.982226	2026-06-18 21:45:17.982226	3	guia-0000048	20605712241
52	00000049	2026-06-05	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T002-3191	1	REGISTRADA	\N	2026-06-18 21:57:12.389588	2026-06-18 21:57:12.389588	3	guia-0000049	20605712241
53	00000050	2026-06-12	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T002-3234	1	REGISTRADA	\N	2026-06-19 16:24:27.760596	2026-06-19 16:24:27.760596	3	guia-0000050	20605712241
54	00000051	2026-06-12	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T002-2855	1	REGISTRADA	\N	2026-06-19 17:20:28.69059	2026-06-19 17:20:28.69059	3	guia-0000051	20605712241
55	00000052	2026-06-08	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	TA01-0004136	1	REGISTRADA	\N	2026-06-19 17:38:36.828358	2026-06-19 17:38:36.828358	3	guia-0000052	20605712241
56	00000053	2026-06-12	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T002-4814	1	REGISTRADA	\N	2026-06-19 17:51:36.270972	2026-06-19 17:51:36.270972	3	guia-0000053	20605712241
57	00000054	2026-06-16	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	T002-3246	1	REGISTRADA	\N	2026-06-19 18:02:49.020161	2026-06-19 18:02:49.020161	3	guia-0000054	20605712241
\.


--
-- Data for Name: notas_salida; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notas_salida (id, numero_salida, cliente_id, fecha, tipo_documento, numero_documento, fecha_ingreso, motivo_salida, responsable_id, estado, observaciones, created_at, updated_at, cliente_ruc) FROM stdin;
4	00000001	2	2026-05-21	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-21 17:49:31.918911	2026-05-21 17:49:31.918911	20600124871
5	00000002	8	2026-05-21	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-21 21:06:17.11392	2026-05-21 21:06:17.11392	20605390332
6	00000003	8	2026-05-22	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-21 21:43:34.983856	2026-05-21 21:43:34.983856	20605390332
7	00000004	6	2026-05-22	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 15:12:52.558649	2026-05-22 15:12:52.558649	20610696571
8	00000005	9	2026-03-02	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:09:57.514601	2026-05-22 17:09:57.514601	20613045440
9	00000006	9	2026-03-04	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:14:08.486781	2026-05-22 17:14:08.486781	20613045440
10	00000007	9	2026-03-04	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:16:28.605482	2026-05-22 17:16:28.605482	20613045440
11	00000008	9	2026-03-10	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:23:05.139482	2026-05-22 17:23:05.139482	20613045440
12	00000009	9	2026-03-10	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:25:18.977672	2026-05-22 17:25:18.977672	20613045440
13	00000010	9	2026-03-10	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:26:35.69029	2026-05-22 17:26:35.69029	20613045440
14	00000011	9	2026-03-23	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:28:04.298217	2026-05-22 17:28:04.298217	20613045440
15	00000012	9	2026-03-23	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:29:35.012756	2026-05-22 17:29:35.012756	20613045440
16	00000013	9	2026-03-26	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:31:09.613972	2026-05-22 17:31:09.613972	20613045440
17	00000014	9	2026-03-30	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:33:26.953266	2026-05-22 17:33:26.953266	20613045440
18	00000015	9	2026-03-30	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:34:46.675756	2026-05-22 17:34:46.675756	20613045440
19	00000016	9	2026-03-30	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:37:38.322872	2026-05-22 17:37:38.322872	20613045440
20	00000017	9	2026-04-01	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:39:25.688242	2026-05-22 17:39:25.688242	20613045440
21	00000018	9	2026-04-01	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:40:24.186056	2026-05-22 17:40:24.186056	20613045440
22	00000019	9	2026-04-13	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:42:23.818903	2026-05-22 17:42:23.818903	20613045440
23	00000020	9	2026-04-13	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 17:43:30.560051	2026-05-22 17:43:30.560051	20613045440
25	00000022	13	2026-04-08	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 19:51:40.686306	2026-05-22 19:51:40.686306	20611918152
26	00000023	4	2026-03-20	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 20:43:43.348421	2026-05-22 20:43:43.348421	20612226211
27	00000024	7	2026-03-24	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-22 21:21:54.065481	2026-05-22 21:21:54.065481	20613906895
28	00000025	2	2026-05-19	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-27 21:11:41.72801	2026-05-27 21:11:41.72801	20600124871
29	00000026	2	2026-05-25	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-28 17:00:08.378481	2026-05-28 17:00:08.378481	20600124871
30	00000027	2	2026-05-25	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-28 17:02:29.627232	2026-05-28 17:02:29.627232	20600124871
31	00000028	2	2026-05-25	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-28 17:04:47.523325	2026-05-28 17:04:47.523325	20600124871
32	00000029	1	2026-05-26	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-05-29 17:54:09.351306	2026-05-29 17:54:09.351306	20608438018
33	00000030	7	2026-05-26	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-01 20:59:06.41841	2026-06-01 20:59:06.41841	20613906895
34	00000031	7	2026-04-24	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-01 21:18:23.88643	2026-06-01 21:18:23.88643	20613906895
35	00000032	7	2026-04-28	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-01 21:58:22.640255	2026-06-01 21:58:22.640255	20613906895
36	00000033	7	2026-05-05	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-01 22:02:58.227354	2026-06-01 22:02:58.227354	20613906895
37	00000034	2	2026-05-28	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-04 21:47:41.168864	2026-06-04 21:47:41.168864	20600124871
38	00000035	9	2026-04-23	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-11 21:13:56.04266	2026-06-11 21:13:56.04266	20613045440
39	00000036	9	2026-04-27	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-11 21:16:11.028328	2026-06-11 21:16:11.028328	20613045440
40	00000037	9	2026-05-12	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-11 21:22:26.778848	2026-06-11 21:22:26.778848	20613045440
41	00000038	9	2026-05-15	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-11 21:31:35.905996	2026-06-11 21:31:35.905996	20613045440
42	00000039	9	2026-05-15	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-11 21:33:38.610396	2026-06-11 21:33:38.610396	20613045440
43	00000040	9	2026-05-15	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-11 21:46:11.547325	2026-06-11 21:46:11.547325	20613045440
44	00000041	9	2026-05-15	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-11 21:50:20.265373	2026-06-11 21:50:20.265373	20613045440
46	00000043	9	2026-05-15	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-11 21:59:42.18769	2026-06-11 21:59:42.18769	20613045440
47	00000044	9	2026-05-15	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-11 22:06:13.784224	2026-06-11 22:06:13.784224	20613045440
48	00000045	9	2026-05-21	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-12 19:48:29.676502	2026-06-12 19:48:29.676502	20613045440
49	00000046	9	2026-05-22	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-12 19:53:20.388098	2026-06-12 19:53:20.388098	20613045440
50	00000047	9	2026-05-29	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-12 20:03:33.58986	2026-06-12 20:03:33.58986	20613045440
51	00000048	9	2026-05-29	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-12 20:09:12.707425	2026-06-12 20:09:12.707425	20613045440
45	00000042	9	2026-05-15	\N	\N	\N	\N	\N	CANCELADA	 | CANCELADO: 6/12/2026, 8:16:25 PM	2026-06-11 21:56:23.070129	2026-06-12 20:16:25.765786	20613045440
52	00000049	9	2026-05-15	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-12 20:17:20.965928	2026-06-12 20:17:20.965928	20613045440
53	00000050	9	2026-05-15	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-12 20:24:25.622632	2026-06-12 20:24:25.622632	20613045440
54	00000051	8	2026-06-12	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-12 21:26:49.535622	2026-06-12 21:26:49.535622	20605390332
55	00000052	8	2026-04-27	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-12 21:38:00.451488	2026-06-12 21:38:00.451488	20605390332
56	00000053	14	2026-06-17	\N	\N	\N	\N	\N	REGISTRADA	\N	2026-06-18 16:25:55.36302	2026-06-18 16:25:55.36302	20607309478
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, codigo, descripcion, proveedor, tipo_documento, numero_documento, registro_sanitario, lote, fabricante, categoria_ingreso, procedencia, unidad, unidad_otro, um, temperatura_min_c, temperatura_max_c, observaciones, activo, created_at, updated_at, fecha_documento, unidad_medida, cliente_id, proveedor_ruc, cliente_ruc) FROM stdin;
1	afe.pd2205027ve r-100	BLEACHING POWDER THINK WHITE VEGAN NO \r\nMINERAL OILS GREEN COLOUR SACHET X 100 GR X 1 UNID \r\n(YBLONDER 9)	AFECORP PERU S.A.C	\N	\N	\N	99532	INDUSTRIE PAGODA SRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:04.738602	2026-05-21 06:48:04.738602	\N	\N	2	20600124871	20600124871
2	afe.pd2205027ve r-500	BLEACHING POWDER THINK WHITE VEGAN NO \r\nMINERAL OILS GREEN COLOUR BAG X 500 GR X 1 UNID \r\n(YBLONDER 9)	AFECORP PERU S.A.C	\N	\N	\N	99530	INDUSTRIE PAGODA SRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:04.915067	2026-05-21 06:48:04.915067	\N	\N	2	20600124871	20600124871
3	97888eintd	ACAI BERRY HARD WAX BEADS (KIT) X 01 und.	AFECORP PERU S.A.C	\N	\N	\N	FST25062001	AMERICAN INTERNATIONAL INDUSTRIES	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:05.057728	2026-05-21 06:48:05.057728	\N	\N	2	20600124871	20600124871
4	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	AFECORP PERU S.A.C	\N	\N	\N	SP5324050510	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:05.190626	2026-05-21 06:48:05.190626	\N	\N	2	20600124871	20600124871
5	53610009	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA TIPO JUDKINS DERECHA JR4 DE 6 FRENCH X 100 CCM	AFECORP PERU S.A.C	\N	\N	\N	SP5324091912	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:05.333348	2026-05-21 06:48:05.333348	\N	\N	2	20600124871	20600124871
6	11510005	CATÉTER PARA DIAGNÓSTICO CORONARIO CURVA JUDKINS IZQUIERDA JL3.5 DE 5 FRENCH X 100 CM	AFECORP PERU S.A.C	\N	\N	\N	SP1124041023	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:05.489454	2026-05-21 06:48:05.489454	\N	\N	2	20600124871	20600124871
7	41300150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA NO COMPLACIENTE DE DIÁMETRO 3.0 MM DE LONGITUD 15 MM	AFECORP PERU S.A.C	\N	\N	\N	SP4125051505	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:05.656441	2026-05-21 06:48:05.656441	\N	\N	2	20600124871	20600124871
8	41350150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA NO COMPLACIENTE DE DIÁMETRO 3.5 MM DE LONGITUD 15 MM	AFECORP PERU S.A.C	\N	\N	\N	SP4124040324	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:05.790091	2026-05-21 06:48:05.790091	\N	\N	2	20600124871	20600124871
9	11510002	CATÉTER PARA DIAGNÓSTICO CORONARIO CURVA \r\nJUDKINS JR4 DE 5 FRENCH	AFECORP PERU S.A.C	\N	\N	\N	SP1124092024	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:05.923029	2026-05-21 06:48:05.923029	\N	\N	2	20600124871	20600124871
10	41400150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA NO COMPLACIENTE DE DIÁMETRO 4.0 MM DE LONGITUD 15 MM	AFECORP PERU S.A.C	\N	\N	\N	SP4125080402	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:06.077833	2026-05-21 06:48:06.077833	\N	\N	2	20600124871	20600124871
11	hc 329	GEL HOT AROMATIZANTE CORPORAL-FRUTAS VERMELHAS 35ml X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	33998	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:06.215552	2026-05-21 06:48:06.215552	\N	\N	2	20600124871	20600124871
12	hc 110	GEL HOT AROMATIZANTE CORPORAL-MORANGO 35ml X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	34047	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:06.34769	2026-05-21 06:48:06.34769	\N	\N	2	20600124871	20600124871
13	hc 111	GEL HOT AROMATIZANTE CORPORAL-MENTA 35ml X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	32965	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:06.483462	2026-05-21 06:48:06.483462	\N	\N	2	20600124871	20600124871
14	hc 109	GEL HOT AROMATIZANTE CORPORAL-CHOCOLATE 35ml X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	34985	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:06.640447	2026-05-21 06:48:06.640447	\N	\N	2	20600124871	20600124871
15	hc 292	GEL ICED AROMATIZANTE CORPORAL-CHOCOMENTA 35ml X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	34415	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:06.786846	2026-05-21 06:48:06.786846	\N	\N	2	20600124871	20600124871
16	hc 250u	GEL LUBRICANTE INTIMO - DELIRIUM X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	34413	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:06.919686	2026-05-21 06:48:06.919686	\N	\N	2	20600124871	20600124871
17	hc 251u	GEL LUBRICANTE INTIMO - EXCITATION X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	35088	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:07.059248	2026-05-21 06:48:07.059248	\N	\N	2	20600124871	20600124871
18	hc 254u	GEL LUBRICANTE INTIMO - INTI LOOB X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	34374	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:07.231083	2026-05-21 06:48:07.231083	\N	\N	2	20600124871	20600124871
19	hc 497	GEL LUBRICANTE INTIMO - Fresh Lub Mentalyptus X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	34525	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:07.378491	2026-05-21 06:48:07.378491	\N	\N	2	20600124871	20600124871
20	hc 498	GEL LUBRICANTE INTIMO - Fresh Lub Morango X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	35133	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:07.528301	2026-05-21 06:48:07.528301	\N	\N	2	20600124871	20600124871
21	hc 515	GEL LUBRICANTE INTIMO - Hot Lub X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	32781	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:07.663704	2026-05-21 06:48:07.663704	\N	\N	2	20600124871	20600124871
22	hc 585	HOT BALL-LUBRICANTE INTIMO - Hot Ball Menta 4g X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	34689	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:07.799665	2026-05-21 06:48:07.799665	\N	\N	2	20600124871	20600124871
23	hc 621	HOT BALL-LUBRICANTE INTIMO - Hot ball mix 4g X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	34919	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:07.940656	2026-05-21 06:48:07.940656	\N	\N	2	20600124871	20600124871
24	hc 733	BUTTERFLY GEL FEMININO X 1 UND	AFECORP PERU S.A.C	\N	\N	\N	35201	NS PRODUTOS E SISTEMAS DE HIGIENELTDA	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:08.271852	2026-05-21 06:48:08.271852	\N	\N	2	20600124871	20600124871
25	50225150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA SEMICOMPLACIENTE DE DIÁMETRO 2.25 MM X 15 MM	AFECORP PERU S.A.C	\N	\N	\N	SP5024091403	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:08.41156	2026-05-21 06:48:08.41156	\N	\N	2	20600124871	20600124871
26	50200150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA SEMICOMPLACIENTE DE DIÁMETRO 2 MM X 15 MM	AFECORP PERU S.A.C	\N	\N	\N	SP5025090304	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:08.566115	2026-05-21 06:48:08.566115	\N	\N	2	20600124871	20600124871
27	1	KINESSENCES COLOR 6.O	AFECORP PERU S.A.C	\N	\N	\N	VM03	KIN COSMETICS S.A.U.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:08.714057	2026-05-21 06:48:08.714057	\N	\N	2	20600124871	20600124871
28	2	KINESSENCES COLOR 7.O	AFECORP PERU S.A.C	\N	\N	\N	SM04	KIN COSMETICS S.A.U.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:08.851678	2026-05-21 06:48:08.851678	\N	\N	2	20600124871	20600124871
29	3	KINESSENCES COLOR 8.O	AFECORP PERU S.A.C	\N	\N	\N	VM03	KIN COSMETICS S.A.U.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:09.008813	2026-05-21 06:48:09.008813	\N	\N	2	20600124871	20600124871
30	4	KINESSENCES NOURISH GENTLE SHAMPOO	AFECORP PERU S.A.C	\N	\N	\N	VM03/38	KIN COSMETICS S.A.U.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:09.180623	2026-05-21 06:48:09.180623	\N	\N	2	20600124871	20600124871
31	5	KINESSENCES ANTIOX INTENSE MASK	AFECORP PERU S.A.C	\N	\N	\N	PL02/17	KIN COSMETICS S.A.U.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:09.315262	2026-05-21 06:48:09.315262	\N	\N	2	20600124871	20600124871
32	6	KINSTYLE CURLY CREAM	AFECORP PERU S.A.C	\N	\N	\N	TM04/64	KIN COSMETICS S.A.U.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:09.454787	2026-05-21 06:48:09.454787	\N	\N	2	20600124871	20600124871
33	7	KINESSENCES NOURISH INTENSE MASK 200 ML	AFECORP PERU S.A.C	\N	\N	\N	VM03	KIN COSMETICS S.A.U.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:09.595124	2026-05-21 06:48:09.595124	\N	\N	2	20600124871	20600124871
34	8	KINESSENCES ANTIOX NECTAR 150 ML	AFECORP PERU S.A.C	\N	\N	\N	SM04	KIN COSMETICS S.A.U.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:09.766074	2026-05-21 06:48:09.766074	\N	\N	2	20600124871	20600124871
35	9	KINESSENCES NOURISH OIL CREAM 50 ML	AFECORP PERU S.A.C	\N	\N	\N	VM03	KIN COSMETICS S.A.U.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:10.022497	2026-05-21 06:48:10.022497	\N	\N	2	20600124871	20600124871
36	10	KINESSENCES NOURISH INTENSE MASK 900 ML	AFECORP PERU S.A.C	\N	\N	\N	VM03/38	KIN COSMETICS S.A.U.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:10.164211	2026-05-21 06:48:10.164211	\N	\N	2	20600124871	20600124871
37	41275150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA NO COMPLACIENTE DE\r\nDIÁMETRO 2.75 MM DE LONGITUD 15 MM	AFECORP PERU S.A.C	\N	\N	\N	SP4125022805	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:10.330096	2026-05-21 06:48:10.330096	\N	\N	2	20600124871	20600124871
38	s22	BREAST PUMP (EXTRACTOR DE LECHE MATERNA,S/M,S22)	AFECORP PERU S.A.C	\N	\N	\N	202510	NINGBO MARKET UNION GROUP	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:10.466343	2026-05-21 06:48:10.466343	\N	\N	2	20600124871	20600124871
39	s09	BREAST PUMP (EXTRACTOR DE LECHE MATERNA,S/M,S09)	AFECORP PERU S.A.C	\N	\N	\N	202510	NINGBO MARKET UNION GROUP	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:10.605394	2026-05-21 06:48:10.605394	\N	\N	2	20600124871	20600124871
40	s20	EXTRACTOR DE LECHE MATERNA, S/M, S22	AFECORP PERU S.A.C	\N	\N	\N	202510	TENSUN NETWORK CO.,LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:10.745268	2026-05-21 06:48:10.745268	\N	\N	2	20600124871	20600124871
41	hpc480e	CONECTOR DE PRESION 48" 122CM 1200 PSI X 01 UND.	AFECORP PERU S.A.C	\N	\N	\N	I3370429	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:10.895207	2026-05-21 06:48:10.895207	\N	\N	2	20600124871	20600124871
42	iq35f180j3	GUIA INQWIRE 3mm J 0.035” 180 X 01 UND.	AFECORP PERU S.A.C	\N	\N	\N	K3371732	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:11.034737	2026-05-21 06:48:11.034737	\N	\N	2	20600124871	20600124871
43	iq35f260j3	GUIA INQWIRE 3mm J 0.035” 260 X 01 UND.	AFECORP PERU S.A.C	\N	\N	\N	K3371675	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:11.182201	2026-05-21 06:48:11.182201	\N	\N	2	20600124871	20600124871
44	7521-13	CATETER PERFORMA JUDKINS 5F JL3.5 X 01 UND.	AFECORP PERU S.A.C	\N	\N	\N	I3356227	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:11.35173	2026-05-21 06:48:11.35173	\N	\N	2	20600124871	20600124871
45	bm-bid-i30	JERINGA DE ALTA PRESIÓN CON MANÓMETRO DE 20 CC -\r\nBROSMED X 01 UND.	AFECORP PERU S.A.C	\N	\N	\N	2511114218	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:11.518427	2026-05-21 06:48:11.518427	\N	\N	2	20600124871	20600124871
46	bm-hv01	Y CONNECTOR SETS  X  01 UND.	AFECORP PERU S.A.C	\N	\N	\N	2506106166	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:11.657903	2026-05-21 06:48:11.657903	\N	\N	2	20600124871	20600124871
47	phr5f11021pw	INTRODUCTOR RADIAL HIDROFILICO PRELUDE EASE 5FR X 11 CM X 01 UND.	AFECORP PERU S.A.C	\N	\N	\N	H2735360	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:11.801408	2026-05-21 06:48:11.801408	\N	\N	2	20600124871	20600124871
48	phr6f11021pw	INTRODUCTOR RADIAL HIDROFILICO PRELUDE EASE 6FR X 11 CM X 01 UND.	AFECORP PERU S.A.C	\N	\N	\N	H3247331	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:11.945622	2026-05-21 06:48:11.945622	\N	\N	2	20600124871	20600124871
49	srb24ac	BANDA COMPRENSORA RADIAL PRELUDE SYNC 24AC X 01 UND.	AFECORP PERU S.A.C	\N	\N	\N	I3385327	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:12.088458	2026-05-21 06:48:12.088458	\N	\N	2	20600124871	20600124871
50	7523-13	CATETER PERFORMA JUDKINS 5F JR 3.5 X 01 UND.	AFECORP PERU S.A.C	\N	\N	\N	I3356253	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:12.226889	2026-05-21 06:48:12.226889	\N	\N	2	20600124871	20600124871
51	12673-05	CIERRE VASCULAR-PROGLIDE X 01 UND.	AFECORP PERU S.A.C	\N	\N	\N	6021241	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 06:48:12.376234	2026-05-21 06:48:12.376234	\N	\N	2	20600124871	20600124871
52	8426420085984	3307257 CHUPETE SMOOTHIE. Silicona. 0-6m AZ X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2511090101	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:56.714722	2026-05-21 18:14:56.714722	\N	\N	8	20605390332	20605390332
53	8426420086097	3307269 CHUPETE SMOOTHIE. Silicona. 6-18m AZ X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2511047801	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:56.873973	2026-05-21 18:14:56.873973	\N	\N	8	20605390332	20605390332
54	8426420086103	3307269 CHUPETE SMOOTHIE. Silicona. 6-18m RS X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2510042301	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:57.031779	2026-05-21 18:14:57.031779	\N	\N	8	20605390332	20605390332
55	8426420078726	3401405 CHUPETE ZERO.ZEROTM. 0-6m. X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2510010701	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:57.177402	2026-05-21 18:14:57.177402	\N	\N	8	20605390332	20605390332
56	8426420078719	3401404 CHUPETE ZERO.ZEROTM. -2-2m. X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2510067901	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:57.317056	2026-05-21 18:14:57.317056	\N	\N	8	20605390332	20605390332
57	8426420072229	3307044 TETINA FISIOLOGICA SX PRO. Silicona +6m. X 02 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2509030901	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:57.454543	2026-05-21 18:14:57.454543	\N	\N	8	20605390332	20605390332
58	8426420081634	3307269 CHUPETE SMOOTHIE. Silicona. 6-18m VD X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2511014801	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:57.594586	2026-05-21 18:14:57.594586	\N	\N	8	20605390332	20605390332
59	8426420081696	3307257 CHUPETE SMOOTHIE. Silicona. 0-6m VD X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2511015301	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:57.743334	2026-05-21 18:14:57.743334	\N	\N	8	20605390332	20605390332
60	8426420086752	3400766 STRAW TRAINER CUP (Vaso de pajita) OSOS VD I3 x 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	241189400	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:57.895278	2026-05-21 18:14:57.895278	\N	\N	8	20605390332	20605390332
61	8426420085991	3307257 CHUPETE SMOOTHIE. Silicona. 0-6m. RS X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2512003601	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:58.041874	2026-05-21 18:14:58.041874	\N	\N	8	20605390332	20605390332
62	8426420083843	3307540 CHUPETE FISIOLOGICO SX PRO + BIBERON CON TETINA FISIOLÓGICA SX PRO +BROCHE. 0-6 WALK\r\nGREEN X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2403049101	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:58.185217	2026-05-21 18:14:58.185217	\N	\N	8	20605390332	20605390332
63	8426420904278	3307319 CHUPETE FISIOLÓGICO SX PRO. Silicona. 0-6M WILD RS X 02 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2509098301	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:58.324479	2026-05-21 18:14:58.324479	\N	\N	8	20605390332	20605390332
64	8426420904285	3307319 CHUPETE FISIOLÓGICO SX PRO. Silicona. 0-6M WILD AZ X 02 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2510071701	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:58.467778	2026-05-21 18:14:58.467778	\N	\N	8	20605390332	20605390332
65	8426420904339	3307330 CHUPETE FISIOLÓGICO SX PRO. Silicona. 6-18m WILD RS X 02 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2509047201	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:58.6199	2026-05-21 18:14:58.6199	\N	\N	8	20605390332	20605390332
66	8426420904346	3307330 CHUPETE FISIOLÓGICO SX PRO. Silicona. 6-18m WILD AZ X 02 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2510098701	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:58.760321	2026-05-21 18:14:58.760321	\N	\N	8	20605390332	20605390332
67	8426420904780	3307019 BIBERON CON TETINA FISIOLOGICA SX PRO. Silicona 150ml WILD AZ X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2509092101	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:58.901984	2026-05-21 18:14:58.901984	\N	\N	8	20605390332	20605390332
68	8426420904841	3307059 BIBERON CON TETINA FISIOLOGICA SX PRO. Silicona 270ml  WILD AZ X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2509111101	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:59.043754	2026-05-21 18:14:59.043754	\N	\N	8	20605390332	20605390332
69	8426420904902	3307085 BIBERON CON TETINA FISIOLOGICA SX PRO. Silicona 360ml RS X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2509109401	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:59.189569	2026-05-21 18:14:59.189569	\N	\N	8	20605390332	20605390332
70	8426420000581	BABY COLOGNE 100ml. X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	25101143	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:59.331599	2026-05-21 18:14:59.331599	\N	\N	8	20605390332	20605390332
71	8426420083850	3307540 CHUPETE FISIOLOGICO SX PRO + BIBERON CON TETINA FISIOLÓGICA SX PRO +BROCHE. 0-6 WALK\r\nPINK X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2402052101	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:59.481556	2026-05-21 18:14:59.481556	\N	\N	8	20605390332	20605390332
72	8426420904773	3307019 BIBERON CON TETINA FISIOLOGICA SX PRO. Silicona 150ml WILD RS X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2507002501	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:59.624966	2026-05-21 18:14:59.624966	\N	\N	8	20605390332	20605390332
73	8426420904834	3307059 BIBERON CON TETINA FISIOLOGICA SX PRO. Silicona 270ml  WILD RS X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2511048601	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:59.776725	2026-05-21 18:14:59.776725	\N	\N	8	20605390332	20605390332
74	8426420904919	3307085 BIBERON CON TETINA FISIOLOGICA SX PRO. Silicona 360ml AZ X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2507076601	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:14:59.92547	2026-05-21 18:14:59.92547	\N	\N	8	20605390332	20605390332
75	8426420079235	3307775 CHUPETE + BIBERÓN ZERO.ZERO X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2510049801	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:00.071641	2026-05-21 18:15:00.071641	\N	\N	8	20605390332	20605390332
76	8426420083478	3307540 CHUPETE FISIOLOGICO SX PRO + BIBERON CON TETINA FISIOLÓGICA SX PRO +BROCHE. 0-6\r\nDREAMS PK X 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2506268201	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:00.22622	2026-05-21 18:15:00.22622	\N	\N	8	20605390332	20605390332
77	8426420051101	3189104 BIBERON ANTICOLICO ZERO ZERO CON TETINA DE FLUJO ADAPTABLE +0M 180 ML x 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2511022701	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:00.366831	2026-05-21 18:15:00.366831	\N	\N	8	20605390332	20605390332
78	8426420032247	DETERGENTE PARA BIBERONES Y TETINAS x 500ml	HDM CAPITAL S.A.C.	\N	\N	\N	25110097	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:00.514159	2026-05-21 18:15:00.514159	\N	\N	8	20605390332	20605390332
79	8426420086738	3400766 STRAW TRAINER CUP (Vaso de pajita) OSOS AZ x 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2411062100	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:00.655548	2026-05-21 18:15:00.655548	\N	\N	8	20605390332	20605390332
80	8426420086745	3400766 STRAW TRAINER CUP (Vaso de pajita) OSOS RS x 01 UND	HDM CAPITAL S.A.C.	\N	\N	\N	2505032900	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:00.801282	2026-05-21 18:15:00.801282	\N	\N	8	20605390332	20605390332
81	8426420007764	3162897 MORDEDOR REFRIGERANTE ETAPA 2 +4M	HDM CAPITAL S.A.C.	\N	\N	\N	2506030700	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:00.951295	2026-05-21 18:15:00.951295	\N	\N	8	20605390332	20605390332
82	8426420049986	3188415 BIBERÓN ANTICÓLICO ZERO.ZERO CON TETINA DE FLUJO ADAPTABLE +0M 180ml	HDM CAPITAL S.A.C.	\N	\N	\N	2511086701	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:01.095651	2026-05-21 18:15:01.095651	\N	\N	8	20605390332	20605390332
83	8426420067416	3306421 ZERO ZERO FOLLOW ON SET 270	HDM CAPITAL S.A.C.	\N	\N	\N	2503052801	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:01.251052	2026-05-21 18:15:01.251052	\N	\N	8	20605390332	20605390332
84	8426420083461	3307540 CHUPETE FISIOLÓGICO SX PRO + BIBERÓN CON TETINA FIFIOLÓGICA SX PRO + BROCHE DREAMS BL	HDM CAPITAL S.A.C.	\N	\N	\N	2506049601	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:01.41259	2026-05-21 18:15:01.41259	\N	\N	8	20605390332	20605390332
85	8426420087049	3306384 TETINA PARA EL BIBERON ZERO.ZEROTM + 6M	HDM CAPITAL S.A.C.	\N	\N	\N	2510075401	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:01.563262	2026-05-21 18:15:01.563262	\N	\N	8	20605390332	20605390332
86	8426420087056	3188420 TETINA PARA EL BIBERON ZERO.ZEROTM + 0M	HDM CAPITAL S.A.C.	\N	\N	\N	2510075501	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:01.876022	2026-05-21 18:15:01.876022	\N	\N	8	20605390332	20605390332
87	8426420087063	3188419 TETINA PARA EL BIBERON ZERO.ZEROTM + 0M	HDM CAPITAL S.A.C.	\N	\N	\N	2511023301	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:02.02617	2026-05-21 18:15:02.02617	\N	\N	8	20605390332	20605390332
88	8426420050005	3188416 BIBERÓN ANTICÓLICO ZERO.ZERO CON TETINA DE FLUJO MEDIO +0M 270ml	HDM CAPITAL S.A.C.	\N	\N	\N	2511053301	SUAVINEX GROUP, S.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-21 18:15:02.172479	2026-05-21 18:15:02.172479	\N	\N	8	20605390332	20605390332
89	wml-320	CLIPS DE LIGADURA WEL-LOK MEDIANO GRANDES x Caja	IMPORTACIONES MEDICAS RZ S.A.C.	\N	\N	\N	2025255	EOMEDICA SAC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 15:00:07.376432	2026-05-22 15:00:07.376432	\N	\N	\N	20610696571	20610696571
90	s01-l4	OXYGEN MASKS FOR SINGLE USE X 01 UND.	IMPORTACIONES MEDICAS RZ S.A.C.	\N	\N	\N	2601061	QINGDAO HIPROVE MEDICAL TECHNOLOGIES CO.,LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 15:00:07.545109	2026-05-22 15:00:07.545109	\N	\N	\N	20610696571	20610696571
91	esp4978	ESPATULA CITO CEPILLO MEDIPLAST X 100	JR MEDIC E.I.R.L.	\N	\N	\N	20240620	ALCIMAR´S MEDIC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:44.528383	2026-05-22 17:03:44.528383	\N	\N	9	20613045440	20613045440
92	his8135	HISOPOS DE MADERA ESTERIL ALFYMEDIX X 100	JR MEDIC E.I.R.L.	\N	\N	\N	HE0325AM	ALCIMAR´S MEDIC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:44.738916	2026-05-22 17:03:44.738916	\N	\N	9	20613045440	20613045440
93	gua8760	GUANTES DE NITRILO PARA EXAMEN AZUL (M) \r\nENDO GLOVE  X 100	JR MEDIC E.I.R.L.	\N	\N	\N	IN25008662	ALCIMAR´S MEDIC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:44.878087	2026-05-22 17:03:44.878087	\N	\N	9	20613045440	20613045440
94	gua8761	GUANTES DE NITRILO NO ESTERIL (AZUL COBALTO) (L)\r\n MEDICAL B&T X 100	JR MEDIC E.I.R.L.	\N	\N	\N	212164	ALCIMAR´S MEDIC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:45.018964	2026-05-22 17:03:45.018964	\N	\N	9	20613045440	20613045440
95	esp0253	ESPECULO VAGINAL DE PLASTICO (M) IQ MEDIC X 01	JR MEDIC E.I.R.L.	\N	\N	\N	20250418	ALCIMAR´S MEDIC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:45.158718	2026-05-22 17:03:45.158718	\N	\N	9	20613045440	20613045440
96	alg0045	ALGODÓN HIDROFILO 500 G ROLLO STERILAB X 01	JR MEDIC E.I.R.L.	\N	\N	\N	210015	ALCIMAR´S MEDIC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:45.315071	2026-05-22 17:03:45.315071	\N	\N	9	20613045440	20613045440
97	kb328/22	TISCHLER PINZA PARA BIOPSIA UTER.22 CM NOPA	JR MEDIC E.I.R.L.	\N	\N	\N	G253	EDVAMEDICAL E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:45.462072	2026-05-22 17:03:45.462072	\N	\N	9	20613045440	20613045440
98	mul0001	MULTICARE IN CHOLESTEROL STRIPS CJA X 25T	JR MEDIC E.I.R.L.	\N	\N	\N	IN1240527	PFH LAB MEDIC E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:45.606208	2026-05-22 17:03:45.606208	\N	\N	9	20613045440	20613045440
99	mul0003	MULTICARE IN TRIGLYCERIDES STRIPS CJA X 25T	JR MEDIC E.I.R.L.	\N	\N	\N	IN250523	PFH LAB MEDIC E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:45.747361	2026-05-22 17:03:45.747361	\N	\N	9	20613045440	20613045440
100	7819382023	accu-chek Instant  50 tiras reactivas  x tubo	JR MEDIC E.I.R.L.	\N	\N	\N	303919	CORPORACION LYACOS E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:45.890864	2026-05-22 17:03:45.890864	\N	\N	9	20613045440	20613045440
101	hem-7154-e	MONITOR DE PRESION ARTERIAL DE BRAZO BPM-M3	JR MEDIC E.I.R.L.	\N	\N	\N	202507V	FERVAL BABY SAC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:46.027435	2026-05-22 17:03:46.027435	\N	\N	9	20613045440	20613045440
102	m3	MONITOR PACIENTE TRIAJE 5.6" CONFIGURADO 3 \r\nPARAMETROS SP02/PNI/TEMP	JR MEDIC E.I.R.L.	\N	\N	\N	360124-M24912370023	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:46.168605	2026-05-22 17:03:46.168605	\N	\N	9	20613045440	20613045440
103	98.979	ELECTROCARDIOGRAFO PORTATIL	JR MEDIC E.I.R.L.	\N	\N	\N	361527- M25C10210005	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:46.308467	2026-05-22 17:03:46.308467	\N	\N	9	20613045440	20613045440
104	prod0016892	ICHROMA HBA1C NEO (HEMOGLOBINA GLICOSILADA) CAJA X 25 T.	JR MEDIC E.I.R.L.	\N	\N	\N	AAVLK09EX	RAPIDIAGNOSTICS S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:46.452199	2026-05-22 17:03:46.452199	\N	\N	9	20613045440	20613045440
105	244444321	ICHROMA MAU (MICROALBUMINA EN ORINA) CAJA X 25T	JR MEDIC E.I.R.L.	\N	\N	\N	MAVFH04EX	RAPIDIAGNOSTICS S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:46.633948	2026-05-22 17:03:46.633948	\N	\N	9	20613045440	20613045440
106	86.825	MONITOR PACIENTE 12" CONFIGURADO 6 PARAMETROS TACTIL IM70 EDAN	JR MEDIC E.I.R.L.	\N	\N	\N	360080-M25520140001	MANUFACTURA MEDICA Y ORTOPEDICA S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:46.776777	2026-05-22 17:03:46.776777	\N	\N	9	20613045440	20613045440
107	min-015.01	LISANTE M52 DIFF X 500ML(BC-5140)MINDRAY	JR MEDIC E.I.R.L.	\N	\N	\N	2025081551	ANDINA MEDICA FILIAL PERU	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:46.913403	2026-05-22 17:03:46.913403	\N	\N	9	20613045440	20613045440
108	min-016.01	LISANTE M-52LH X 100ML (BC5140) MINDRAY	JR MEDIC E.I.R.L.	\N	\N	\N	2025081451	ANDINA MEDICA FILIAL PERU	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 17:03:47.060606	2026-05-22 17:03:47.060606	\N	\N	9	20613045440	20613045440
109	20260225J1	OMEGA 3 + VITAMINA E CAPSULA BLANDA FRASCO X 60 UND	SALUDBOOST S.A.C.	Invoice	XATGY260203J1	\N	20260225J1	Xi'an Tianguangyuan Biotech Co.,Ltd.	\N	CHINA	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 19:39:46.25746	2026-05-22 19:39:46.25746	\N	\N	13	20611918152	20611918152
110	sm 12-362	FORCEPS HARTMANN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062301	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:39.024652	2026-05-22 20:15:39.024652	\N	\N	1	20608438018	20608438018
111	sm 12-363	FORCEPS HARTMANN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062302	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:39.180868	2026-05-22 20:15:39.180868	\N	\N	1	20608438018	20608438018
112	sm 12-364	FORCEPS HARTMANN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062303	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:39.324582	2026-05-22 20:15:39.324582	\N	\N	1	20608438018	20608438018
113	sm 12-367	FORCEPS DUCKBILL x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062304	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:39.475726	2026-05-22 20:15:39.475726	\N	\N	1	20608438018	20608438018
114	sm 12-365	FORCEPS HARTMANN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062305	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:39.621677	2026-05-22 20:15:39.621677	\N	\N	1	20608438018	20608438018
115	sm 112-23012	FORCEPS HALSTEAD MOSQUITO x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062306	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:39.765136	2026-05-22 20:15:39.765136	\N	\N	1	20608438018	20608438018
116	sm 110-17412	FORCEPS ADSON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062307	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:39.906472	2026-05-22 20:15:39.906472	\N	\N	1	20608438018	20608438018
117	sm 110-17912	FORCEPS ADSON DRESSING  x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062308	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:40.049728	2026-05-22 20:15:40.049728	\N	\N	1	20608438018	20608438018
118	sm 110-18802	FORCEPS BROWN-ADSON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062309	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:40.190934	2026-05-22 20:15:40.190934	\N	\N	1	20608438018	20608438018
119	sm 142-94004	FORCEPS BISHOP-HARMON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062310	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:40.328116	2026-05-22 20:15:40.328116	\N	\N	1	20608438018	20608438018
120	sm 142-94006	FORCEPS BISHOP-HARMON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062311	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:40.462993	2026-05-22 20:15:40.462993	\N	\N	1	20608438018	20608438018
121	sm 112-23112	FORCEPS HALSTEAD MOSQUITO x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062312	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:40.611991	2026-05-22 20:15:40.611991	\N	\N	1	20608438018	20608438018
122	sm 112-22012	FORCEPS HALSTEAD MOSQUITO x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062313	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:40.764051	2026-05-22 20:15:40.764051	\N	\N	1	20608438018	20608438018
123	sm 112-21010	FORCEPS HARTMANN MOSQUITO x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062314	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:40.908062	2026-05-22 20:15:40.908062	\N	\N	1	20608438018	20608438018
124	sm 112-21110	FORCEPS HARTMANN MOSQUITO x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062315	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:41.05269	2026-05-22 20:15:41.05269	\N	\N	1	20608438018	20608438018
125	sm 144-20616	FORCEPS LUCAE-JANSEN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062316	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:41.194219	2026-05-22 20:15:41.194219	\N	\N	1	20608438018	20608438018
126	sm 144-20614	FORCEPS LUCAE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062317	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:41.338064	2026-05-22 20:15:41.338064	\N	\N	1	20608438018	20608438018
127	sm 114-11109	FORCEPS BACKHAUS TOWEL x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062318	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:41.479174	2026-05-22 20:15:41.479174	\N	\N	1	20608438018	20608438018
128	sm 114-11111	FORCEPS BACKHAUS TOWEL x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062319	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:41.614833	2026-05-22 20:15:41.614833	\N	\N	1	20608438018	20608438018
129	sm 114-11113	FORCEPS BACKHAUS TOWEL x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062320	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:41.760198	2026-05-22 20:15:41.760198	\N	\N	1	20608438018	20608438018
130	sm 12-369	FORCEPS HARTMANN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062321	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:42.121821	2026-05-22 20:15:42.121821	\N	\N	1	20608438018	20608438018
131	sm 154-52015	FORCEPS LAHEY VULSELLUM x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062322	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:42.261601	2026-05-22 20:15:42.261601	\N	\N	1	20608438018	20608438018
132	sm 112-24014	FORCEPS KELLY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062323	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:42.409393	2026-05-22 20:15:42.409393	\N	\N	1	20608438018	20608438018
133	sm 112-24114	FORCEPS KELLY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062324	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:42.555362	2026-05-22 20:15:42.555362	\N	\N	1	20608438018	20608438018
134	sm 05-150	FORCEPS KELLY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062325	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:42.692636	2026-05-22 20:15:42.692636	\N	\N	1	20608438018	20608438018
135	sm 05-151	FORCEPS KELLY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062326	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:42.8412	2026-05-22 20:15:42.8412	\N	\N	1	20608438018	20608438018
136	sm 112-31014	FORCEPS ROCHESTER PEAN HEMOSTATIC FORCEPS x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062327	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:42.98531	2026-05-22 20:15:42.98531	\N	\N	1	20608438018	20608438018
137	sm 112-31016	FORCEPS ROCHESTER PEAN HEMOSTATIC FORCEPS x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062328	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:43.140369	2026-05-22 20:15:43.140369	\N	\N	1	20608438018	20608438018
138	sm 112-31020	FORCEPS ROCHESTER PEAN HEMOSTATIC FORCEPS x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062329	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:43.282032	2026-05-22 20:15:43.282032	\N	\N	1	20608438018	20608438018
139	sm 112-31116	FORCEPS ROCHESTER PEAN HEMOSTATIC FORCEPS x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062330	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:43.42344	2026-05-22 20:15:43.42344	\N	\N	1	20608438018	20608438018
140	sm 112-31118	FORCEPS ROCHESTER PEAN HEMOSTATIC FORCEPS x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062331	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:43.560444	2026-05-22 20:15:43.560444	\N	\N	1	20608438018	20608438018
141	sm 12-360	FORCEPS HARTMANN-WULLSTEIN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062332	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:43.703954	2026-05-22 20:15:43.703954	\N	\N	1	20608438018	20608438018
142	sm 12-366	FORCEPS HARTMANN-NOYES x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062333	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:43.848764	2026-05-22 20:15:43.848764	\N	\N	1	20608438018	20608438018
143	sm 05-940	FORCEPS MARTEL x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062334	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:44.114423	2026-05-22 20:15:44.114423	\N	\N	1	20608438018	20608438018
144	sm 110-17612	FORCEPS ADSON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062335	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:44.253676	2026-05-22 20:15:44.253676	\N	\N	1	20608438018	20608438018
145	sm 110-18805	FORCEPS BROWN-ADSON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062336	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:44.395445	2026-05-22 20:15:44.395445	\N	\N	1	20608438018	20608438018
146	sm 110-33201	FORCEPS JEWELERS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062337	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:44.535777	2026-05-22 20:15:44.535777	\N	\N	1	20608438018	20608438018
147	sm 110-33012	FORCEPS JEWELERS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062338	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:44.688708	2026-05-22 20:15:44.688708	\N	\N	1	20608438018	20608438018
148	sm 110-33225	FORCEPS JEWELERS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062339	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:44.830005	2026-05-22 20:15:44.830005	\N	\N	1	20608438018	20608438018
149	sm 110-18012	FORCEPS ADSON TISSUE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062340	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:44.981594	2026-05-22 20:15:44.981594	\N	\N	1	20608438018	20608438018
150	sm 110-18812	FORCEPS BROWN-ADSON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062341	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:45.128968	2026-05-22 20:15:45.128968	\N	\N	1	20608438018	20608438018
151	sm 112-22112	FORCEPS HALSTEAD MOSQUITO x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062342	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:45.275939	2026-05-22 20:15:45.275939	\N	\N	1	20608438018	20608438018
152	sm 112-25114	FORCEPS CRILE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062344	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:45.430238	2026-05-22 20:15:45.430238	\N	\N	1	20608438018	20608438018
153	sm 05-770	FORCEPS ROEDER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062345	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:45.578781	2026-05-22 20:15:45.578781	\N	\N	1	20608438018	20608438018
154	sm 05-771	FORCEPS ROEDER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062346	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:45.721124	2026-05-22 20:15:45.721124	\N	\N	1	20608438018	20608438018
155	sm 143-07605	FORCEPS GREEN FIXATION x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062347	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:45.862172	2026-05-22 20:15:45.862172	\N	\N	1	20608438018	20608438018
156	sm 110-22417	FORCEPS CUSHING x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062348	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:46.009382	2026-05-22 20:15:46.009382	\N	\N	1	20608438018	20608438018
157	sm 04-840	FORCEPS STANDARD x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062349	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:46.150306	2026-05-22 20:15:46.150306	\N	\N	1	20608438018	20608438018
158	sm 110-22217	FORCEPS CUSHING x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062350	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:46.290753	2026-05-22 20:15:46.290753	\N	\N	1	20608438018	20608438018
159	sm 110-22517	FORCEPS CUSHING x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062351	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:46.438127	2026-05-22 20:15:46.438127	\N	\N	1	20608438018	20608438018
160	sm 114-10309	FORCEPS JONES TOWEL x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062352	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:46.581288	2026-05-22 20:15:46.581288	\N	\N	1	20608438018	20608438018
161	sm 146-26120	SCISSORS CAPLAN SEPTUM x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062201	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:46.724324	2026-05-22 20:15:46.724324	\N	\N	1	20608438018	20608438018
162	sm 146-26122	SCISSORS CAPLAN SEPTUM x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062202	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:46.887578	2026-05-22 20:15:46.887578	\N	\N	1	20608438018	20608438018
163	sm 108-40213	SCISSORS FOMON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062203	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:47.031659	2026-05-22 20:15:47.031659	\N	\N	1	20608438018	20608438018
164	sm 108-40354	SCISSORS FOMON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062204	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:47.17547	2026-05-22 20:15:47.17547	\N	\N	1	20608438018	20608438018
165	sm 108-40716	SCISSORS COTTLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062205	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:47.329299	2026-05-22 20:15:47.329299	\N	\N	1	20608438018	20608438018
166	sm 108-21011	SCISSORS DEVINE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062206	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:47.484637	2026-05-22 20:15:47.484637	\N	\N	1	20608438018	20608438018
167	sm 03-460	SCISSORS FOMON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062207	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:47.631297	2026-05-22 20:15:47.631297	\N	\N	1	20608438018	20608438018
168	sm 108-40118	SCISSORS HEYMANN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062208	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:47.771876	2026-05-22 20:15:47.771876	\N	\N	1	20608438018	20608438018
169	sm 03-360	SCISSORS METZENBAUM x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062209	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:47.927712	2026-05-22 20:15:47.927712	\N	\N	1	20608438018	20608438018
170	sm 108-34211	SCISSORS IRIS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062210	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:48.070068	2026-05-22 20:15:48.070068	\N	\N	1	20608438018	20608438018
171	sm 108-34311	SCISSORS IRIS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062211	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:48.215139	2026-05-22 20:15:48.215139	\N	\N	1	20608438018	20608438018
172	sm 108-21518	SCISSORS GORNEY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062212	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:48.366557	2026-05-22 20:15:48.366557	\N	\N	1	20608438018	20608438018
173	sm 108-21520	SCISSORS GORNEY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062213	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:48.518193	2026-05-22 20:15:48.518193	\N	\N	1	20608438018	20608438018
174	sm 108-21523	SCISSORS GORNEY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062214	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:48.660694	2026-05-22 20:15:48.660694	\N	\N	1	20608438018	20608438018
175	sm 108-21220	SCISSORS GORNEY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062215	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:48.813783	2026-05-22 20:15:48.813783	\N	\N	1	20608438018	20608438018
176	sm 108-36051	SCISSORS STEVENS TENOTOMY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062216	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:48.962609	2026-05-22 20:15:48.962609	\N	\N	1	20608438018	20608438018
177	sm 108-36151	SCISSORS STEVENS TENOTOMY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062217	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:49.112769	2026-05-22 20:15:49.112769	\N	\N	1	20608438018	20608438018
178	sm 108-21918	SCISSORS FREEMAN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062218	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:49.403306	2026-05-22 20:15:49.403306	\N	\N	1	20608438018	20608438018
179	sm 108-22018	SCISSORS FREEMAN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062219	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:49.543067	2026-05-22 20:15:49.543067	\N	\N	1	20608438018	20608438018
180	sm 108-23315	SCISSORS KAYE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062220	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:49.691257	2026-05-22 20:15:49.691257	\N	\N	1	20608438018	20608438018
181	sm 108-23323	SCISSORS KAYE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062221	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:49.870715	2026-05-22 20:15:49.870715	\N	\N	1	20608438018	20608438018
182	sm 108-20911	SCISSORS PAR STYLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062222	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:50.015166	2026-05-22 20:15:50.015166	\N	\N	1	20608438018	20608438018
183	sm 108-20914	SCISSORS PAR STYLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062223	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:50.159792	2026-05-22 20:15:50.159792	\N	\N	1	20608438018	20608438018
184	sm 108-31212	SCISSORS KILNER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062224	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:50.308894	2026-05-22 20:15:50.308894	\N	\N	1	20608438018	20608438018
185	sm 108-31412	SCISSORS KILNER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062225	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:50.456812	2026-05-22 20:15:50.456812	\N	\N	1	20608438018	20608438018
186	sm 108-21620	SCISSORS FREEMAN GORNEY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062226	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:50.633371	2026-05-22 20:15:50.633371	\N	\N	1	20608438018	20608438018
187	sm 108-21720	SCISSORS FREEMAN GORNEY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062227	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:50.77116	2026-05-22 20:15:50.77116	\N	\N	1	20608438018	20608438018
188	sm 108-24516	SCISSORS ASTON-FACE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062228	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:50.915797	2026-05-22 20:15:50.915797	\N	\N	1	20608438018	20608438018
189	sm 108-24520	SCISSORS ASTON-FACE x 1  unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062229	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:51.063474	2026-05-22 20:15:51.063474	\N	\N	1	20608438018	20608438018
190	sm 12-605	RETRACTORS FARABEUF x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062001	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:51.206354	2026-05-22 20:15:51.206354	\N	\N	1	20608438018	20608438018
191	sm 118-25615	RETRACTORS YANCOSKIE LIFT RETRACTOR x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062002	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:51.376047	2026-05-22 20:15:51.376047	\N	\N	1	20608438018	20608438018
192	sm 138-31342	RETRACTORS BREAST RETRACTORS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062003	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:51.521876	2026-05-22 20:15:51.521876	\N	\N	1	20608438018	20608438018
193	sm 138-31432	RETRACTORS BREAST RETRACTORS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062004	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:51.661585	2026-05-22 20:15:51.661585	\N	\N	1	20608438018	20608438018
194	sm 146-55116	RETRACTORS AUFRICHT x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062005	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:51.797938	2026-05-22 20:15:51.797938	\N	\N	1	20608438018	20608438018
195	sm 146-55126	RETRACTORS AUFRICHT x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062006	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:51.94007	2026-05-22 20:15:51.94007	\N	\N	1	20608438018	20608438018
196	sm 07-200	RETRACTORS DEAVER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062007	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:52.080987	2026-05-22 20:15:52.080987	\N	\N	1	20608438018	20608438018
197	sm 07-201	RETRACTORS DEAVER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062008	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:52.217274	2026-05-22 20:15:52.217274	\N	\N	1	20608438018	20608438018
198	sm 07-202	RETRACTORS DEAVER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062009	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:52.356191	2026-05-22 20:15:52.356191	\N	\N	1	20608438018	20608438018
199	sm 118-25222	RETRACTORS FREEMAN RAKE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062010	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:52.497112	2026-05-22 20:15:52.497112	\N	\N	1	20608438018	20608438018
200	sm 118-25238	RETRACTORS FREEMAN RAKE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062011	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:52.70106	2026-05-22 20:15:52.70106	\N	\N	1	20608438018	20608438018
201	sm 12-602	RETRACTORS ROUX x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062012	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:52.84181	2026-05-22 20:15:52.84181	\N	\N	1	20608438018	20608438018
202	sm 12-603	RETRACTORS ROUX x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062013	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:52.991409	2026-05-22 20:15:52.991409	\N	\N	1	20608438018	20608438018
203	sm 12-604	RETRACTORS ROUX x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062014	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:53.146619	2026-05-22 20:15:53.146619	\N	\N	1	20608438018	20608438018
204	sm 146-56810	RETRACTORS CAROLINE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062015	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:53.312881	2026-05-22 20:15:53.312881	\N	\N	1	20608438018	20608438018
205	sm 12-607	RETRACTORS PARKER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062016	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:53.466596	2026-05-22 20:15:53.466596	\N	\N	1	20608438018	20608438018
206	sm 148-57701	RETRACTORS FISCHL x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062017	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:53.626812	2026-05-22 20:15:53.626812	\N	\N	1	20608438018	20608438018
207	sm 148-58716	RETRACTORS WISE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062018	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:53.796624	2026-05-22 20:15:53.796624	\N	\N	1	20608438018	20608438018
208	sm 148-90301	RETRACTORS HAJEK'S x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062019	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:53.972277	2026-05-22 20:15:53.972277	\N	\N	1	20608438018	20608438018
209	sm 138-31133	RETRACTORS BREAST RETRACTORS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062020	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:54.12752	2026-05-22 20:15:54.12752	\N	\N	1	20608438018	20608438018
210	sm 10-409	RETRACTORS ADSON-BABY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062021	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:54.282347	2026-05-22 20:15:54.282347	\N	\N	1	20608438018	20608438018
211	sm 118-23908	RETRACTORS KAWAMOTO x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062022	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:54.572883	2026-05-22 20:15:54.572883	\N	\N	1	20608438018	20608438018
212	sm 10-406	RETRACTORS HENLEY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062023	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:54.720822	2026-05-22 20:15:54.720822	\N	\N	1	20608438018	20608438018
213	sm 10-407	RETRACTORS MISKIMON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062024	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:54.862712	2026-05-22 20:15:54.862712	\N	\N	1	20608438018	20608438018
214	sm 07-203	RETRACTORS HARRINGTON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062025	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:55.008964	2026-05-22 20:15:55.008964	\N	\N	1	20608438018	20608438018
215	sm 07-204	RETRACTORS HARRINGTON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062026	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:55.1578	2026-05-22 20:15:55.1578	\N	\N	1	20608438018	20608438018
216	sm 07-205	RETRACTORS HARRINGTON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062027	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:55.290308	2026-05-22 20:15:55.290308	\N	\N	1	20608438018	20608438018
217	sm 07-206	RETRACTORS HARRINGTON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062028	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:55.441113	2026-05-22 20:15:55.441113	\N	\N	1	20608438018	20608438018
218	sm 07-207	RETRACTORS HARRINGTON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062029	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:55.579734	2026-05-22 20:15:55.579734	\N	\N	1	20608438018	20608438018
219	sm 07-208	RETRACTORS HARRINGTON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062030	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:55.725915	2026-05-22 20:15:55.725915	\N	\N	1	20608438018	20608438018
220	sm 07-209	RETRACTORS HARRINGTON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062031	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:55.87875	2026-05-22 20:15:55.87875	\N	\N	1	20608438018	20608438018
221	sm 07-210	RETRACTORS HARRINGTON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062032	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:56.019026	2026-05-22 20:15:56.019026	\N	\N	1	20608438018	20608438018
222	sm 07-211	RETRACTORS HARRINGTON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062033	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:56.162715	2026-05-22 20:15:56.162715	\N	\N	1	20608438018	20608438018
223	sm 07-212	RETRACTORS HARRINGTON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062034	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:56.305147	2026-05-22 20:15:56.305147	\N	\N	1	20608438018	20608438018
224	sm 10-411	RETRACTORS ADSON-BABY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062035	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:56.445259	2026-05-22 20:15:56.445259	\N	\N	1	20608438018	20608438018
225	sm 10-410	RETRACTORS ADSON-BABY x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062036	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:56.589678	2026-05-22 20:15:56.589678	\N	\N	1	20608438018	20608438018
226	sm 118-16017	RETRACTORS SENN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062037	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:56.726872	2026-05-22 20:15:56.726872	\N	\N	1	20608438018	20608438018
227	sm 118-19516	RETRACTORS HAMRA x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062038	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:56.865616	2026-05-22 20:15:56.865616	\N	\N	1	20608438018	20608438018
228	sm 118-24316	RETRACTORS KASDEN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062039	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:57.007226	2026-05-22 20:15:57.007226	\N	\N	1	20608438018	20608438018
229	sm 118-67014	RETRACTORS WEITLANER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062040	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:57.146958	2026-05-22 20:15:57.146958	\N	\N	1	20608438018	20608438018
230	sm 146-54615	RETRACTORS SHEEN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062041	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:57.28699	2026-05-22 20:15:57.28699	\N	\N	1	20608438018	20608438018
231	sm 118-25122	RETRACTORS MAXWELL FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062042	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:57.425621	2026-05-22 20:15:57.425621	\N	\N	1	20608438018	20608438018
232	sm 118-25138	RETRACTORS MAXWELL FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062043	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:57.567305	2026-05-22 20:15:57.567305	\N	\N	1	20608438018	20608438018
233	sm 118-65010	RETRACTORS WEITLANER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062044	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:57.708008	2026-05-22 20:15:57.708008	\N	\N	1	20608438018	20608438018
234	sm 118-55080	RETRACTORS TEBBETTS STYLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062045	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:57.846567	2026-05-22 20:15:57.846567	\N	\N	1	20608438018	20608438018
235	sm 118-55090	RETRACTORS TEBBETTS STYLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062046	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:57.984421	2026-05-22 20:15:57.984421	\N	\N	1	20608438018	20608438018
236	sm 118-55092	RETRACTORS TEBBETTS STYLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062047	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:58.130816	2026-05-22 20:15:58.130816	\N	\N	1	20608438018	20608438018
237	sm 118-55100	RETRACTORS TEBBETTS STYLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062048	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:58.272971	2026-05-22 20:15:58.272971	\N	\N	1	20608438018	20608438018
238	sm 142-37613	RETRACTORS ROLLET x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062049	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:58.412716	2026-05-22 20:15:58.412716	\N	\N	1	20608438018	20608438018
239	sm 118-24314	RETRACTORS RAGNELL x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062051	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:58.568481	2026-05-22 20:15:58.568481	\N	\N	1	20608438018	20608438018
240	sm 148-57215	RETRACTORS CRONIN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062052	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:58.70894	2026-05-22 20:15:58.70894	\N	\N	1	20608438018	20608438018
241	sm 118-24911	RETRACTORS ANDERSON BEAR CLAW x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062053	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:58.855902	2026-05-22 20:15:58.855902	\N	\N	1	20608438018	20608438018
242	sm 118-25011	RETRACTORS ANDERSON BEAR CLAW x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062054	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:59.000153	2026-05-22 20:15:59.000153	\N	\N	1	20608438018	20608438018
243	sm118-25318	RETRACTORS LIFT RETRACTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062055	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:59.154956	2026-05-22 20:15:59.154956	\N	\N	1	20608438018	20608438018
244	sm 118-56112	RETRACTORS FLAP RETRACTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062056	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:59.297166	2026-05-22 20:15:59.297166	\N	\N	1	20608438018	20608438018
245	sm 146-55412	RETRACTORS CONVERSE ALAR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062057	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:59.444305	2026-05-22 20:15:59.444305	\N	\N	1	20608438018	20608438018
246	sm 10-403	RETRACTORS BECKMANN-EATON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062058	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:59.725546	2026-05-22 20:15:59.725546	\N	\N	1	20608438018	20608438018
247	sm 10-404	RETRACTORS BECKMANN-EATON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062059	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:15:59.87569	2026-05-22 20:15:59.87569	\N	\N	1	20608438018	20608438018
248	sm 118-80121	RETRACTORS FARR SPRING RETRACTOR x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062060	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:00.012842	2026-05-22 20:16:00.012842	\N	\N	1	20608438018	20608438018
249	sm 146-55920	RETRACTORS COTTLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062067	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:00.154763	2026-05-22 20:16:00.154763	\N	\N	1	20608438018	20608438018
250	sm 118-63510	RETRACTORS HOLTZHEIMER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062061	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:00.295946	2026-05-22 20:16:00.295946	\N	\N	1	20608438018	20608438018
251	sm 118-63410	RETRACTORS HOLTZHEIMER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062062	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:00.440378	2026-05-22 20:16:00.440378	\N	\N	1	20608438018	20608438018
252	sm 138-30242	RETRACTORS BREAST RETRACTORS  x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062063	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:00.582868	2026-05-22 20:16:00.582868	\N	\N	1	20608438018	20608438018
253	sm 118-63710	RETRACTORS HOLTZHEIMER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062064	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:00.722606	2026-05-22 20:16:00.722606	\N	\N	1	20608438018	20608438018
254	sm 118-55480	RETRACTORS TEBBETTS STYLE  x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062065	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:00.869387	2026-05-22 20:16:00.869387	\N	\N	1	20608438018	20608438018
255	sm 118-55490	RETRACTORS TEBBETTS STYLE  x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062066	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:01.032556	2026-05-22 20:16:01.032556	\N	\N	1	20608438018	20608438018
256	sm 10-200	DISSECTORS CASPAR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062101	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:01.193026	2026-05-22 20:16:01.193026	\N	\N	1	20608438018	20608438018
257	sm 10-160	DISSECTORS GRAHAM x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062102	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:01.346944	2026-05-22 20:16:01.346944	\N	\N	1	20608438018	20608438018
258	sm 10-170	DISSECTORS SACHS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062103	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:01.501728	2026-05-22 20:16:01.501728	\N	\N	1	20608438018	20608438018
259	sm 10-190	DISSECTORS GILLIES x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062104	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:01.641415	2026-05-22 20:16:01.641415	\N	\N	1	20608438018	20608438018
260	sm 10-191	DISSECTORS GILLIES x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062105	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:01.792994	2026-05-22 20:16:01.792994	\N	\N	1	20608438018	20608438018
261	sm 10-210	DISSECTORS LAHEY CLINIC x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062106	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:01.942763	2026-05-22 20:16:01.942763	\N	\N	1	20608438018	20608438018
262	sm 138-32102	DISSECTORS NERVE DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062107	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:02.130982	2026-05-22 20:16:02.130982	\N	\N	1	20608438018	20608438018
263	sm 138-32112	DISSECTORS NERVE DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062108	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:02.317409	2026-05-22 20:16:02.317409	\N	\N	1	20608438018	20608438018
264	sm 10-240	DISSECTORS TOENNIS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062109	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:02.473482	2026-05-22 20:16:02.473482	\N	\N	1	20608438018	20608438018
265	sm-504.14	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062401	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:17.704515	2026-05-22 20:16:17.704515	\N	\N	1	20608438018	20608438018
266	sm-504.21	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062402	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:17.855061	2026-05-22 20:16:17.855061	\N	\N	1	20608438018	20608438018
267	sm-501.22	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062403	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:18.007006	2026-05-22 20:16:18.007006	\N	\N	1	20608438018	20608438018
268	sm-506.51	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062404	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:18.161187	2026-05-22 20:16:18.161187	\N	\N	1	20608438018	20608438018
269	sm-506.56	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062405	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:18.310897	2026-05-22 20:16:18.310897	\N	\N	1	20608438018	20608438018
270	sm-501.17	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062406	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:18.458547	2026-05-22 20:16:18.458547	\N	\N	1	20608438018	20608438018
271	sm-501.18	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062407	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:18.625415	2026-05-22 20:16:18.625415	\N	\N	1	20608438018	20608438018
272	sm-501.19	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062408	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:18.780491	2026-05-22 20:16:18.780491	\N	\N	1	20608438018	20608438018
273	sm-504.05	LIPOSUCTION CANNULAS V-DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062409	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:18.94653	2026-05-22 20:16:18.94653	\N	\N	1	20608438018	20608438018
274	sm-201.31	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062410	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:19.102466	2026-05-22 20:16:19.102466	\N	\N	1	20608438018	20608438018
275	sm-201.32	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062411	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:19.260096	2026-05-22 20:16:19.260096	\N	\N	1	20608438018	20608438018
276	sm-201.33	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062412	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:19.422776	2026-05-22 20:16:19.422776	\N	\N	1	20608438018	20608438018
277	sm-201.34	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062413	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:19.577781	2026-05-22 20:16:19.577781	\N	\N	1	20608438018	20608438018
278	sm-201.35	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062414	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:19.73227	2026-05-22 20:16:19.73227	\N	\N	1	20608438018	20608438018
279	sm-201.36	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062415	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:19.877977	2026-05-22 20:16:19.877977	\N	\N	1	20608438018	20608438018
280	sm-201.37	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062416	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:20.035449	2026-05-22 20:16:20.035449	\N	\N	1	20608438018	20608438018
281	sm-201.38	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062417	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:20.19918	2026-05-22 20:16:20.19918	\N	\N	1	20608438018	20608438018
282	sm-201.39	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062418	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:20.360696	2026-05-22 20:16:20.360696	\N	\N	1	20608438018	20608438018
283	sm-201.40	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062419	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:20.527014	2026-05-22 20:16:20.527014	\N	\N	1	20608438018	20608438018
284	sm-202.31	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062420	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:20.679657	2026-05-22 20:16:20.679657	\N	\N	1	20608438018	20608438018
285	sm-202.32	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062421	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:20.840313	2026-05-22 20:16:20.840313	\N	\N	1	20608438018	20608438018
286	sm-202.33	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062422	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:21.000964	2026-05-22 20:16:21.000964	\N	\N	1	20608438018	20608438018
287	sm-202.34	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062423	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:21.152432	2026-05-22 20:16:21.152432	\N	\N	1	20608438018	20608438018
288	sm-203.31	LIPOSUCTION CANNULAS STANDARD, SINGLE HOLE x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062424	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:21.299229	2026-05-22 20:16:21.299229	\N	\N	1	20608438018	20608438018
289	sm-101.33	LIPOSUCTION CANNULAS FACELIFT INFILTRATION\r\nCANNULA x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062425	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:21.456671	2026-05-22 20:16:21.456671	\N	\N	1	20608438018	20608438018
290	sm-101.34	LIPOSUCTION CANNULAS FACELIFT INFILTRATION\r\nCANNULA x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062426	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:21.617479	2026-05-22 20:16:21.617479	\N	\N	1	20608438018	20608438018
291	sm-102.31	LIPOSUCTION CANNULAS FACELIFT INFILTRATION\r\nCANNULA x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062427	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:21.784889	2026-05-22 20:16:21.784889	\N	\N	1	20608438018	20608438018
292	sm-102.32	LIPOSUCTION CANNULAS FACELIFT INFILTRATION\r\nCANNULA x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062428	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:21.949155	2026-05-22 20:16:21.949155	\N	\N	1	20608438018	20608438018
293	sm-201.56	LIPOSUCTION CANNULAS MERCEDES x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062429	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:22.095291	2026-05-22 20:16:22.095291	\N	\N	1	20608438018	20608438018
294	sm-201.57	LIPOSUCTION CANNULAS MERCEDES x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062430	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:22.255655	2026-05-22 20:16:22.255655	\N	\N	1	20608438018	20608438018
295	sm-204.01	LIPOSUCTION CANNULAS STEVENS STYLE CANNULA x\r\n1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062431	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:22.467224	2026-05-22 20:16:22.467224	\N	\N	1	20608438018	20608438018
296	sm-204.02	LIPOSUCTION CANNULAS STEVENS STYLE CANNULA x\r\n1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062432	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:22.626132	2026-05-22 20:16:22.626132	\N	\N	1	20608438018	20608438018
297	sm-204.03	LIPOSUCTION CANNULAS STEVENS STYLE CANNULA x\r\n1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062433	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:22.908191	2026-05-22 20:16:22.908191	\N	\N	1	20608438018	20608438018
298	sm-506.60	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062434	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:23.074476	2026-05-22 20:16:23.074476	\N	\N	1	20608438018	20608438018
299	sm-506.61	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062435	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:23.256453	2026-05-22 20:16:23.256453	\N	\N	1	20608438018	20608438018
300	sm-506.62	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062436	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:23.435963	2026-05-22 20:16:23.435963	\N	\N	1	20608438018	20608438018
301	sm-506.64	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062438	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:23.597755	2026-05-22 20:16:23.597755	\N	\N	1	20608438018	20608438018
302	sm-502.23	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062439	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:23.769854	2026-05-22 20:16:23.769854	\N	\N	1	20608438018	20608438018
303	sm-502.24	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062440	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:23.929949	2026-05-22 20:16:23.929949	\N	\N	1	20608438018	20608438018
304	sm-605.01	LIPOSUCTION CANNULAS INJECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062441	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:24.088592	2026-05-22 20:16:24.088592	\N	\N	1	20608438018	20608438018
305	sm-701-01	LIPOSUCTION CANNULAS HANDLES FOR CANNULAS x\r\n1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062442	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:24.27863	2026-05-22 20:16:24.27863	\N	\N	1	20608438018	20608438018
306	sm-405.701	LIPOSUCTION CANNULAS LITTLE INJECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062443	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:24.436213	2026-05-22 20:16:24.436213	\N	\N	1	20608438018	20608438018
307	sm-405.702	LIPOSUCTION CANNULAS LITTLE INJECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062444	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:24.6021	2026-05-22 20:16:24.6021	\N	\N	1	20608438018	20608438018
308	sm-405.703	LIPOSUCTION CANNULAS LITTLE INJECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062445	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:24.776382	2026-05-22 20:16:24.776382	\N	\N	1	20608438018	20608438018
309	sm-505.16	LIPOSUCTION CANNULAS FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062446	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:24.929067	2026-05-22 20:16:24.929067	\N	\N	1	20608438018	20608438018
310	sm-501.21	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062447	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:25.129973	2026-05-22 20:16:25.129973	\N	\N	1	20608438018	20608438018
311	sm-506.101	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062448	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:25.284945	2026-05-22 20:16:25.284945	\N	\N	1	20608438018	20608438018
312	sm-501.23	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062449	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:25.438239	2026-05-22 20:16:25.438239	\N	\N	1	20608438018	20608438018
313	sm-501.24	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062450	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:25.586914	2026-05-22 20:16:25.586914	\N	\N	1	20608438018	20608438018
314	sm-501.25	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062451	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:25.745795	2026-05-22 20:16:25.745795	\N	\N	1	20608438018	20608438018
315	sm-501.26	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062452	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:25.902405	2026-05-22 20:16:25.902405	\N	\N	1	20608438018	20608438018
316	sm-501.27	LIPOSUCTION CANNULAS FIELD FLAP x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062453	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:26.048314	2026-05-22 20:16:26.048314	\N	\N	1	20608438018	20608438018
317	sm-701-03	LIPOSUCTION CANNULAS HANDLES FOR CANNULAS x\r\n1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062454	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:26.214259	2026-05-22 20:16:26.214259	\N	\N	1	20608438018	20608438018
318	sm-605.04	LIPOSUCTION CANNULAS INJECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062455	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:26.398584	2026-05-22 20:16:26.398584	\N	\N	1	20608438018	20608438018
319	sm-602.01	LIPOSUCTION CANNULAS TONNARD HARVESTER x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062456	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:26.569362	2026-05-22 20:16:26.569362	\N	\N	1	20608438018	20608438018
320	sm-602.02	LIPOSUCTION CANNULAS TONNARD HARVESTER x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062457	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:26.731194	2026-05-22 20:16:26.731194	\N	\N	1	20608438018	20608438018
321	sm-603.01	LIPOSUCTION CANNULAS TONNARD HARVESTER x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062461	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:26.902514	2026-05-22 20:16:26.902514	\N	\N	1	20608438018	20608438018
322	sm-604.01	LIPOSUCTION CANNULAS CARRAWAY HARVESTER x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062458	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:27.067881	2026-05-22 20:16:27.067881	\N	\N	1	20608438018	20608438018
323	sm-604.02	LIPOSUCTION CANNULAS CARRAWAY HARVESTER x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062459	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:27.217631	2026-05-22 20:16:27.217631	\N	\N	1	20608438018	20608438018
324	sm-604.03	LIPOSUCTION CANNULAS CARRAWAY HARVESTER x 1\r\nunidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062460	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:16:27.376261	2026-05-22 20:16:27.376261	\N	\N	1	20608438018	20608438018
325	ACCLARIX AX3	SISTEMA DE ULTRASONIDOS DIAGNOSTICO - ACCLARIX AX3 - Por caja	SUNIX MEDICAL S.A.C.	Guía de Remisión Remitente	EG07-00000008	\N	SN-560435M25308290001	EDAN INSTRUMENTS INC	\N	CHINA	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 20:37:53.121513	2026-05-22 20:37:53.121513	\N	\N	4	20612226211	20612226211
326	2040355	LIDOCAINA S/PRESERVANTE AZUL X UND	LINEAGE	Guía de Remisión Remitente	T005-00148820	\N	2040355	COBEFAR S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 21:14:24.242114	2026-05-22 21:14:24.242114	\N	\N	7	20613906895	20613906895
327	2103144	PARACETAMOL 100 MG/ML X 10 ML GOTAS	LINEAGE	Guía de Remisión Remitente	T005-00148821	\N	2103144	COBEFAR S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-05-22 21:18:20.758755	2026-05-22 21:18:20.758755	\N	\N	7	20613906895	20613906895
328	sm 10-180	DISSECTORS FRAZIER x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062110	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:02.359167	2026-05-26 00:22:02.359167	\N	\N	1	20608438018	20608438018
329	sm 138-32103	DISSECTORS ORBITAL RIM DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062111	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:02.537692	2026-05-26 00:22:02.537692	\N	\N	1	20608438018	20608438018
330	sm 10-220	DISSECTORS SACHS x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062112	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:02.682404	2026-05-26 00:22:02.682404	\N	\N	1	20608438018	20608438018
331	sm 138-32104	DISSECTORS TEMPORAL DISSECOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062113	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:02.828552	2026-05-26 00:22:02.828552	\N	\N	1	20608438018	20608438018
332	sm 138-32114	DISSECTORS TEMPORAL DISSECOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062114	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:02.971991	2026-05-26 00:22:02.971991	\N	\N	1	20608438018	20608438018
333	sm 138-32009	DISSECTORS FLAP DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062115	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:03.119516	2026-05-26 00:22:03.119516	\N	\N	1	20608438018	20608438018
334	sm 138-32008	DISSECTORS MIDFACE FASCIA DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062116	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:03.278315	2026-05-26 00:22:03.278315	\N	\N	1	20608438018	20608438018
335	sm 138-32018	DISSECTORS MIDFACE FASCIA DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062117	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:03.436345	2026-05-26 00:22:03.436345	\N	\N	1	20608438018	20608438018
336	sm 138-32101	DISSECTORS MIDFACE FASCIA DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062118	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:03.58001	2026-05-26 00:22:03.58001	\N	\N	1	20608438018	20608438018
337	sm 138-32111	DISSECTORS MIDFACE FASCIA DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062119	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:03.719398	2026-05-26 00:22:03.719398	\N	\N	1	20608438018	20608438018
338	sm 138-32019	DISSECTORS FLAP DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062120	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:03.858905	2026-05-26 00:22:03.858905	\N	\N	1	20608438018	20608438018
339	sm 10-250	DISSECTORS DURA TWIST HOOK x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062121	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:04.002242	2026-05-26 00:22:04.002242	\N	\N	1	20608438018	20608438018
340	sm 10-110	DISSECTORS SCOVILLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062122	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:04.138617	2026-05-26 00:22:04.138617	\N	\N	1	20608438018	20608438018
341	sm 10-120	DISSECTORS SCOVILLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062123	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:04.279328	2026-05-26 00:22:04.279328	\N	\N	1	20608438018	20608438018
342	sm 138-32105	DISSECTORS PERIOSTEAL DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062124	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:04.420356	2026-05-26 00:22:04.420356	\N	\N	1	20608438018	20608438018
343	sm 138-32115	DISSECTORS PERIOSTEAL DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062125	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:04.566698	2026-05-26 00:22:04.566698	\N	\N	1	20608438018	20608438018
344	sm 138-32013	DISSECTORS DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062126	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:04.71108	2026-05-26 00:22:04.71108	\N	\N	1	20608438018	20608438018
345	sm 138-32005	DISSECTORS DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062127	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:04.861678	2026-05-26 00:22:04.861678	\N	\N	1	20608438018	20608438018
346	sm 138-32015	DISSECTORS DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062128	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:05.033578	2026-05-26 00:22:05.033578	\N	\N	1	20608438018	20608438018
347	sm 138-16033	DISSECTORS DISSECTOR SPATULATED x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062129	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:05.185718	2026-05-26 00:22:05.185718	\N	\N	1	20608438018	20608438018
348	sm 138-15536	DISSECTORS AGRIS-DINGMAN x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062130	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:05.330813	2026-05-26 00:22:05.330813	\N	\N	1	20608438018	20608438018
349	sm 10-230	DISSECTORS ADSON x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062131	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:05.466053	2026-05-26 00:22:05.466053	\N	\N	1	20608438018	20608438018
350	sm 138-32001	DISSECTORS SCALP DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062132	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:05.615954	2026-05-26 00:22:05.615954	\N	\N	1	20608438018	20608438018
351	sm 138-32011	DISSECTORS SCALP DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062133	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:05.763808	2026-05-26 00:22:05.763808	\N	\N	1	20608438018	20608438018
352	sm 138-32002	DISSECTORS SCALP DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062134	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:05.907943	2026-05-26 00:22:05.907943	\N	\N	1	20608438018	20608438018
353	sm 138-32012	DISSECTORS SCALP DISSECTOR x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062135	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:06.042879	2026-05-26 00:22:06.042879	\N	\N	1	20608438018	20608438018
354	sm 10-100	DISSECTORS SCOVILLE x 1 unidad	SUMEDIN S.A.C.	\N	\N	\N	SM0612-062136	SUNMED INSTRUMENTS	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-05-26 00:22:06.193363	2026-05-26 00:22:06.193363	\N	\N	1	20608438018	20608438018
585	evf22513	Evermine50 Coro. Stent System-2.25x13mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH14	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:51.274802	2026-06-04 19:40:51.274802	\N	\N	3	20605712241	20605712241
586	evf22516	Evermine50 Coro. Stent System-2.25x16mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFG99	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:51.467167	2026-06-04 19:40:51.467167	\N	\N	3	20605712241	20605712241
587	evf22519	Evermine50 Coro. Stent System-2.25x19mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH05	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:51.632475	2026-06-04 19:40:51.632475	\N	\N	3	20605712241	20605712241
588	evf22524	Evermine50 Coro. Stent System-2.25x24mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFG94	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:51.781903	2026-06-04 19:40:51.781903	\N	\N	3	20605712241	20605712241
589	evf22529	Evermine50 Coro. Stent System-2.25x29mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH07	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:51.939741	2026-06-04 19:40:51.939741	\N	\N	3	20605712241	20605712241
590	evf22532	Evermine50 Coro. Stent System-2.25x32mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFG78	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:52.100534	2026-06-04 19:40:52.100534	\N	\N	3	20605712241	20605712241
591	evf25013	Evermine50 Coro. Stent System-2.50x13mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH07	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:52.265467	2026-06-04 19:40:52.265467	\N	\N	3	20605712241	20605712241
592	evf25016	Evermine50 Coro. Stent System-2.50x16mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFG82	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:52.416605	2026-06-04 19:40:52.416605	\N	\N	3	20605712241	20605712241
593	evf25019	Evermine50 Coro. Stent System-2.50x19mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFG95	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:52.570659	2026-06-04 19:40:52.570659	\N	\N	3	20605712241	20605712241
594	evf25024	Evermine50 Coro. Stent System-2.50x24mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH10	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:52.724807	2026-06-04 19:40:52.724807	\N	\N	3	20605712241	20605712241
595	evf25029	Evermine50 Coro. Stent System-2.50x29mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH07	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:52.888396	2026-06-04 19:40:52.888396	\N	\N	3	20605712241	20605712241
596	evf25032	Evermine50 Coro. Stent System-2.50x32mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH13	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:53.060747	2026-06-04 19:40:53.060747	\N	\N	3	20605712241	20605712241
597	evf27513	Evermine50 Coro. Stent System-2.75x13mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH10	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:53.229347	2026-06-04 19:40:53.229347	\N	\N	3	20605712241	20605712241
598	evf27516	Evermine50 Coro. Stent System-2.75x16mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH09	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:53.386643	2026-06-04 19:40:53.386643	\N	\N	3	20605712241	20605712241
599	evf27519	Evermine50 Coro. Stent System-2.75x19mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH32	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:53.547241	2026-06-04 19:40:53.547241	\N	\N	3	20605712241	20605712241
600	evf27524	Evermine50 Coro. Stent System-2.75x24mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH30	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:53.701855	2026-06-04 19:40:53.701855	\N	\N	3	20605712241	20605712241
601	evf27529	Evermine50 Coro. Stent System-2.75x29mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH24	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:53.860207	2026-06-04 19:40:53.860207	\N	\N	3	20605712241	20605712241
602	evf27532	Evermine50 Coro. Stent System-2.75x32mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH24	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:54.013123	2026-06-04 19:40:54.013123	\N	\N	3	20605712241	20605712241
603	evf30013	Evermine50 Coro. Stent System-3.00x13mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH33	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:54.185519	2026-06-04 19:40:54.185519	\N	\N	3	20605712241	20605712241
604	evf30016	Evermine50 Coro. Stent System-3.00x16mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH18	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:54.345118	2026-06-04 19:40:54.345118	\N	\N	3	20605712241	20605712241
605	evf30019	Evermine50 Coro. Stent System-3.00x19mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH19	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:54.496785	2026-06-04 19:40:54.496785	\N	\N	3	20605712241	20605712241
606	evf30024	Evermine50 Coro. Stent System-3.00x24mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH13	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:54.657807	2026-06-04 19:40:54.657807	\N	\N	3	20605712241	20605712241
607	evf30029	Evermine50 Coro. Stent System-3.00x29mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH32	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:54.832105	2026-06-04 19:40:54.832105	\N	\N	3	20605712241	20605712241
608	evf30032	Evermine50 Coro. Stent System-3.00x32mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH35	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:54.981476	2026-06-04 19:40:54.981476	\N	\N	3	20605712241	20605712241
609	evf30040	Evermine50 Coro. Stent System-3.00x40mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH34	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:55.144248	2026-06-04 19:40:55.144248	\N	\N	3	20605712241	20605712241
610	evf35013	Evermine50 Coro. Stent System-3.50x13mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH25	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:55.308087	2026-06-04 19:40:55.308087	\N	\N	3	20605712241	20605712241
611	evf35016	Evermine50 Coro. Stent System-3.50x16mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH26	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:55.463909	2026-06-04 19:40:55.463909	\N	\N	3	20605712241	20605712241
612	evf35019	Evermine50 Coro. Stent System-3.50x19mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH17	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:55.616712	2026-06-04 19:40:55.616712	\N	\N	3	20605712241	20605712241
613	evf35024	Evermine50 Coro. Stent System-3.50x24mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH33	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:55.774139	2026-06-04 19:40:55.774139	\N	\N	3	20605712241	20605712241
614	evf35029	Evermine50 Coro. Stent System-3.50x29mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH31	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:55.924877	2026-06-04 19:40:55.924877	\N	\N	3	20605712241	20605712241
615	evf35032	Evermine50 Coro. Stent System-3.50x32mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH29	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:56.088412	2026-06-04 19:40:56.088412	\N	\N	3	20605712241	20605712241
616	evf40013	Evermine50 Coro. Stent System-4.00x13mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH23	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:56.373987	2026-06-04 19:40:56.373987	\N	\N	3	20605712241	20605712241
617	evf40016	Evermine50 Coro. Stent System-4.00x16mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH23	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:56.536085	2026-06-04 19:40:56.536085	\N	\N	3	20605712241	20605712241
618	mvl215	MYVAL 21.5 MM - TRANSCATHETER HEART VALVE X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	MVC12	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:56.695674	2026-06-04 19:40:56.695674	\N	\N	3	20605712241	20605712241
619	mvl230	MYVAL 23.0 MM - TRANSCATHETER HEART VALVE X 01  UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	MVC13	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:56.867809	2026-06-04 19:40:56.867809	\N	\N	3	20605712241	20605712241
620	mvl245	MYVAL 24.5 MM TRANSCATHETER HEART VALVE X 01  UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	MVC11	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:57.035009	2026-06-04 19:40:57.035009	\N	\N	3	20605712241	20605712241
621	mvl260	MYVAL 26.0 MM - TRANSCATHETER HEART VALVE X 01  UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	MVC14	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:57.192343	2026-06-04 19:40:57.192343	\N	\N	3	20605712241	20605712241
622	mvl290	MYVAL 29.0MM- TRANSCATHETER HEART VALVE X 01UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	MVC10	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:57.346098	2026-06-04 19:40:57.346098	\N	\N	3	20605712241	20605712241
623	mvl305	MYVAL 30.5 MM - TRANSCATHETER HEART VALVE X 01UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	MVC08	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:57.500294	2026-06-04 19:40:57.500294	\N	\N	3	20605712241	20605712241
624	mvl320	MYVAL 32.0 MM - TRANSCATHETER HEART VALVE X 01  UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	MVC11	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:57.657914	2026-06-04 19:40:57.657914	\N	\N	3	20605712241	20605712241
625	nvt21530	NAVIGATOR 21.5X30MM - TRANSCATHETER HEART VALVE DELIVERY SYSTEM X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTDF63	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:57.815711	2026-06-04 19:40:57.815711	\N	\N	3	20605712241	20605712241
626	nvt23030	NAVIGATOR 23.0X30MM - TRANSCATHETER HEART VALVE DELIVERY SYSTEM X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTDF64	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:57.978479	2026-06-04 19:40:57.978479	\N	\N	3	20605712241	20605712241
627	nvt26030	NAVIGATOR 26.0x30MM - TRANSCATHETER HEART VALVE DELIVERY SYSTEM X 1 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTDF64	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:58.136702	2026-06-04 19:40:58.136702	\N	\N	3	20605712241	20605712241
628	nvt29030	NAVIGATOR 29.0x30MM - TRANSCATHETER HEART VALVE DELIVERY SYSTEM X 1 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTDF57	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:58.313395	2026-06-04 19:40:58.313395	\N	\N	3	20605712241	20605712241
629	nvt30535	NAVIGATOR 30.5x35MM - TRANSCATHETER HEART VALVE DELIVERY SYSTEM X 1 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTDF53	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:58.486123	2026-06-04 19:40:58.486123	\N	\N	3	20605712241	20605712241
630	nvt32035	NAVIGATOR 32.0X35MM - TRANSCATHETER HEART VALVE DELIVERY SYSTEM X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTDF59	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:58.65003	2026-06-04 19:40:58.65003	\N	\N	3	20605712241	20605712241
631	pht14	PYTHON INTRODUCER SET - 14F X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PPHTC61	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:58.808522	2026-06-04 19:40:58.808522	\N	\N	3	20605712241	20605712241
632	vldc	TRANSCATHETER HEART VALVE CRIMPING TOOL (STERILE) X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PVLDCK13	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:58.956808	2026-06-04 19:40:58.956808	\N	\N	3	20605712241	20605712241
633	mtv1840	MAMMOTH 18X40MM BALLOON DILATION CATHETER X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTVD14	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:59.108828	2026-06-04 19:40:59.108828	\N	\N	3	20605712241	20605712241
634	mtv2040	MAMMOTH 20X40MM BALLOON DILATION CATHETER X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTVD20	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:59.263158	2026-06-04 19:40:59.263158	\N	\N	3	20605712241	20605712241
635	mtv2340	MAMMOTH 23X40MM BALLOON DILATION CATHETER X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTVD11	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:59.41876	2026-06-04 19:40:59.41876	\N	\N	3	20605712241	20605712241
636	mtv2540	MAMMOTH 25X40MM BALLOON DILATION CATHETER X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTVD22	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:59.574088	2026-06-04 19:40:59.574088	\N	\N	3	20605712241	20605712241
637	obt6f	OBTURATM VASCULAR CLOSURE DEVICE (6F)	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	POBC13	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:59.726446	2026-06-04 19:40:59.726446	\N	\N	3	20605712241	20605712241
638	obt8f	OBTURATM VASCULAR CLOSURE DEVICE (8F)	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	POBC02	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:40:59.889029	2026-06-04 19:40:59.889029	\N	\N	3	20605712241	20605712241
639	fgtz225012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.25 x 12 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAUFAG	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:00.049186	2026-06-04 19:41:00.049186	\N	\N	3	20605712241	20605712241
640	fgtz225016	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.25 x 16 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZASDAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:00.20671	2026-06-04 19:41:00.20671	\N	\N	3	20605712241	20605712241
641	fgtz225020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.25 x 20 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZASDAJ	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:00.358112	2026-06-04 19:41:00.358112	\N	\N	3	20605712241	20605712241
642	fgtz225024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.25 x 24 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZASCAL	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:00.520489	2026-06-04 19:41:00.520489	\N	\N	3	20605712241	20605712241
643	fgtz225032	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.25 x 32 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	P25TZAGYAD	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:00.678068	2026-06-04 19:41:00.678068	\N	\N	3	20605712241	20605712241
644	fgtz250008	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 8 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAMAAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:00.837062	2026-06-04 19:41:00.837062	\N	\N	3	20605712241	20605712241
645	fgtz250012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 12 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	P25TZAGGAD	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:00.994892	2026-06-04 19:41:00.994892	\N	\N	3	20605712241	20605712241
646	fgtz250016	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 16 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAMXAD	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:01.161533	2026-06-04 19:41:01.161533	\N	\N	3	20605712241	20605712241
647	fgtz250024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 24 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAPKAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:01.324076	2026-06-04 19:41:01.324076	\N	\N	3	20605712241	20605712241
648	fgtz250032	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 32 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	P25TZAFWAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:01.646211	2026-06-04 19:41:01.646211	\N	\N	3	20605712241	20605712241
649	fgtz250036	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 36 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAMZAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:01.812086	2026-06-04 19:41:01.812086	\N	\N	3	20605712241	20605712241
650	fgtz275012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.75 x 12 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZANRAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:01.97611	2026-06-04 19:41:01.97611	\N	\N	3	20605712241	20605712241
651	fgtz275016	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.75 x 16 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAPAAC	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:02.165069	2026-06-04 19:41:02.165069	\N	\N	3	20605712241	20605712241
652	fgtz275020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.75 x 20 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAPKAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:02.326779	2026-06-04 19:41:02.326779	\N	\N	3	20605712241	20605712241
653	fgtz275024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2,75 x 24 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAOZAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:02.487072	2026-06-04 19:41:02.487072	\N	\N	3	20605712241	20605712241
654	fgtz275028	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2,75 x 28 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAPYAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:02.673331	2026-06-04 19:41:02.673331	\N	\N	3	20605712241	20605712241
655	fgtz275032	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2,75 x 32 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	P25TZAGBAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:02.828577	2026-06-04 19:41:02.828577	\N	\N	3	20605712241	20605712241
656	fgtz275036	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2,75 x 36 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	P25TZAEZAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:02.991757	2026-06-04 19:41:02.991757	\N	\N	3	20605712241	20605712241
657	fgtz275040	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2,75 x 40 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAOAAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:03.226108	2026-06-04 19:41:03.226108	\N	\N	3	20605712241	20605712241
658	fgtz300008	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 8 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAOOAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:03.408916	2026-06-04 19:41:03.408916	\N	\N	3	20605712241	20605712241
659	fgtz300016	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 16 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZALJAC	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:03.583838	2026-06-04 19:41:03.583838	\N	\N	3	20605712241	20605712241
660	fgtz300020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 20 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZARNAC	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:03.740971	2026-06-04 19:41:03.740971	\N	\N	3	20605712241	20605712241
661	fgtz300028	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 28 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	P25TZAGDAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:03.893306	2026-06-04 19:41:03.893306	\N	\N	3	20605712241	20605712241
662	fgtz300032	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 32 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	P25TZAFLAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:04.048271	2026-06-04 19:41:04.048271	\N	\N	3	20605712241	20605712241
663	fgtz300036	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 36 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZARYAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:04.199466	2026-06-04 19:41:04.199466	\N	\N	3	20605712241	20605712241
664	fgtz300040	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 40 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAPTAD	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:04.35412	2026-06-04 19:41:04.35412	\N	\N	3	20605712241	20605712241
665	fgtz350012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3.5 x 12 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZANGAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:04.505145	2026-06-04 19:41:04.505145	\N	\N	3	20605712241	20605712241
666	fgtz350016	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3.5 x 16 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZALWAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:04.662627	2026-06-04 19:41:04.662627	\N	\N	3	20605712241	20605712241
667	fgtz350020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3.5 x 20 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAPPAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:04.821678	2026-06-04 19:41:04.821678	\N	\N	3	20605712241	20605712241
668	fgtz350024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3.5 x 24 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZANGAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:04.985257	2026-06-04 19:41:04.985257	\N	\N	3	20605712241	20605712241
669	fgtz350032	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3.5 x 32 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	P25TZAFXAD	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:05.145855	2026-06-04 19:41:05.145855	\N	\N	3	20605712241	20605712241
670	fgtz350036	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3.5 x 36 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	P25TZAGRAF	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:05.306872	2026-06-04 19:41:05.306872	\N	\N	3	20605712241	20605712241
671	fgtz400012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4 x 12 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAOIAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:05.466282	2026-06-04 19:41:05.466282	\N	\N	3	20605712241	20605712241
672	fgtz400016	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4 x 16 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAOCAC	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:05.629717	2026-06-04 19:41:05.629717	\N	\N	3	20605712241	20605712241
673	fgtz400020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4 x 20 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZARJAC	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:05.790074	2026-06-04 19:41:05.790074	\N	\N	3	20605712241	20605712241
674	fgtz400024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4 x 24 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZARPAC	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:05.942031	2026-06-04 19:41:05.942031	\N	\N	3	20605712241	20605712241
675	fgtz400028	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4 x 28 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZARIAE	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:06.088957	2026-06-04 19:41:06.088957	\N	\N	3	20605712241	20605712241
676	fgtz400032	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4 x 32 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAOLAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:06.241118	2026-06-04 19:41:06.241118	\N	\N	3	20605712241	20605712241
677	fgtz450020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4.5 x 20 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAUAAG	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:06.398848	2026-06-04 19:41:06.398848	\N	\N	3	20605712241	20605712241
678	fgtz450024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4.5 x 24 mm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAPGAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:06.551488	2026-06-04 19:41:06.551488	\N	\N	3	20605712241	20605712241
679	fgtz450028	Sirolimus Eluting Cobalt Chromium Coronary Stent System 4.5 x 28\r\nmm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAPGAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:06.83517	2026-06-04 19:41:06.83517	\N	\N	3	20605712241	20605712241
680	fgtz225028	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.25 x 28\r\nmm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZARQAE	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:06.997231	2026-06-04 19:41:06.997231	\N	\N	3	20605712241	20605712241
681	fgtz250020	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 20\r\nmm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAQSAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:07.154553	2026-06-04 19:41:07.154553	\N	\N	3	20605712241	20605712241
682	fgtz250028	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.5 x 28\r\nmm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAKHAC	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:07.30947	2026-06-04 19:41:07.30947	\N	\N	3	20605712241	20605712241
683	fgtz300012	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 12\r\nmm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZANIAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:07.460348	2026-06-04 19:41:07.460348	\N	\N	3	20605712241	20605712241
684	fgtz300024	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3 x 24\r\nmm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZATHAD	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:07.613923	2026-06-04 19:41:07.613923	\N	\N	3	20605712241	20605712241
685	fgtz350028	Sirolimus Eluting Cobalt Chromium Coronary Stent System 3.5 x 28\r\nmm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZALPAA	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:07.762191	2026-06-04 19:41:07.762191	\N	\N	3	20605712241	20605712241
686	1011834hj	GUIA CORONARIA 014 WHISPER EXTRA SUPPORT 190CM X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	5032071	CARDIO PERFUSION EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:07.916678	2026-06-04 19:41:07.916678	\N	\N	3	20605712241	20605712241
687	5583-a3	CATETER VERTEBRAL 5FR X 100CM X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	I3232620	CARDIO PERFUSION EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:08.067889	2026-06-04 19:41:08.067889	\N	\N	3	20605712241	20605712241
688	psi-5f-11-035-18g	INTRODUCTOR PRELUDE C/AGUJA 5F x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	H3201753	CARDIO PERFUSION EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:08.216312	2026-06-04 19:41:08.216312	\N	\N	3	20605712241	20605712241
689	26402704	CATETER GUIA CORONARIO JR3.5 S - AGUJERO 6FR X 01\r\nUND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2309-0232	PHS PERUVIAN HOSPITAL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:08.370436	2026-06-04 19:41:08.370436	\N	\N	3	20605712241	20605712241
690	26402104	CATETER GUIA CORONARIO JL3.5 S-AGUJE. 6F IZQUIERDA X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2309-0228	PHS PERUVIAN HOSPITAL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:08.528422	2026-06-04 19:41:08.528422	\N	\N	3	20605712241	20605712241
691	26402204	CATETER GUIA CORONARIO JL4 S-AGUJE. 6F IZQUIERDA X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2309-0229	PHS PERUVIAN HOSPITAL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:08.678673	2026-06-04 19:41:08.678673	\N	\N	3	20605712241	20605712241
692	ai25	INFLATION DEVICE 20ML,30ATM TY PE II X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	20231007	NIPRO MEDICAL CORPORACION	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:08.834726	2026-06-04 19:41:08.834726	\N	\N	3	20605712241	20605712241
693	psi-6f-11-035-18g	INTRODUCTOR PRELUDE C/AGUJA 6F X 01UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	H3283983	CARDIO PERFUSION EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:08.997877	2026-06-04 19:41:08.997877	\N	\N	3	20605712241	20605712241
694	203hf-r	MANIFOLD TRES CORE X 01UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	H3318717	CARDIO PERFUSION EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:09.160499	2026-06-04 19:41:09.160499	\N	\N	3	20605712241	20605712241
695	mvl200	MYVAL 20.0 MM - TRANSCATHETER HEART VALVE X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	MVC19	MERIL LIFE SCIENCES	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:09.328363	2026-06-04 19:41:09.328363	\N	\N	3	20605712241	20605712241
696	mvl275	MYVAL 27.5 MM - TRANSCATHETER HEART VALVE X 01UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	MVC18	MERIL LIFE SCIENCES	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:09.489662	2026-06-04 19:41:09.489662	\N	\N	3	20605712241	20605712241
697	nvt20030	NAVIGATOR 20.0 X 30 MM - TRANSCATHETER HEART VALVE DELIVERY SYSTEM X 01UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTDF50	MERIL LIFE SCIENCES	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:09.642166	2026-06-04 19:41:09.642166	\N	\N	3	20605712241	20605712241
698	nvt24530	NAVIGATOR 24.5 x 30MM TRANSCATHETER HEART VALVE DELIVERY SYSTEM	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTDF66	MERIL LIFE SCIENCES	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:09.80468	2026-06-04 19:41:09.80468	\N	\N	3	20605712241	20605712241
699	nvt27530	NAVIGATOR 27.5X30MM - TRANSCATHETER HEART VALVE DELIVERY SYSTEM X 01UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	PMTDF62	MERIL LIFE SCIENCES	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:09.95658	2026-06-04 19:41:09.95658	\N	\N	3	20605712241	20605712241
765	101.426	MONITOR FETAL  EDAN F6	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003311	\N	560038-M25910830007	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 16:42:38.958608	2026-06-10 16:42:38.958608	\N	\N	9	20613045440	20613045440
768	ad 010/03	MANGO PARA BISTURI #3 NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-003456	\N	G222	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 18:30:19.128818	2026-06-10 18:30:19.128818	\N	\N	9	20613045440	20613045440
769	ab 060/16	PINZA DISEC. EC. STANDARD C/DIENTE 16CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-003456	\N	G185	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 18:30:19.348084	2026-06-10 18:30:19.348084	\N	\N	9	20613045440	20613045440
770	ab 050/16	PINZA DISEC. EC. STANDARD S/DIENTE 16 CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-003456	\N	G222	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 18:30:19.722301	2026-06-10 18:30:19.722301	\N	\N	9	20613045440	20613045440
771	aa 211/16	PINZA OCHSNER-KOCHER 1:2 CURVA 16 CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-003456	\N	D231	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 18:30:19.874851	2026-06-10 18:30:19.874851	\N	\N	9	20613045440	20613045440
772	ae 100/16	PORTA- AGUJAS MAYO-HEGAR 16 CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-003456	\N	H129	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 18:30:20.045517	2026-06-10 18:30:20.045517	\N	\N	9	20613045440	20613045440
773	ac 070/14	TIJERA MAYO RECTA RR 14.5 CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-003456	\N	H121	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 18:30:20.250985	2026-06-10 18:30:20.250985	\N	\N	9	20613045440	20613045440
774	aa 150/14	PINZA HALSTED-MOSQUITO RECTA14CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-003456	\N	F229	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 18:30:20.428684	2026-06-10 18:30:20.428684	\N	\N	9	20613045440	20613045440
777	02.01.210673	SENSOR SpO2 REUSABLE TIPO ENVOLVENTE NEONATAL C/CONECTOR DB9	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003398	\N	H25B00450463	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C.	\N	CHINA	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 20:30:23.829508	2026-06-10 20:30:23.829508	\N	\N	9	20613045440	20613045440
778	H100B	PULSIOXIMETRO DE MANO SpO2 RECARGABLE	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003398	\N	360101-M25C09810051	MANUFACTURA MEDICA Y ORTOPEDIA S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 20:31:34.587951	2026-06-10 20:31:34.587951	\N	\N	9	20613045440	20613045440
781	ad 010/04	MANGO PARA BISTURI #4 NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003503	\N	G291	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 21:16:36.498369	2026-06-10 21:16:36.498369	\N	\N	9	20613045440	20613045440
782	ab 050/14	PINZA DISEC. EC. STANDARD S/DIENTE 14.5 CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003503	\N	G122	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 21:16:36.655623	2026-06-10 21:16:36.655623	\N	\N	9	20613045440	20613045440
783	aa 210/18	PINZA OCHSNER-KOCHER 1:2 CURVA 18 CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003503	\N	H122	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 21:16:36.808556	2026-06-10 21:16:36.808556	\N	\N	9	20613045440	20613045440
784	ac 365/16	TIJERA P.CORDON UMBILICAL BUSCH DE 16 CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003503	\N	G238	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 21:16:37.171052	2026-06-10 21:16:37.171052	\N	\N	9	20613045440	20613045440
785	ac 351/22	TIJERA P. EPISIOTOMIA BRAUM-STANDLER 22 CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003503	\N	AAB	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 21:16:37.314529	2026-06-10 21:16:37.314529	\N	\N	9	20613045440	20613045440
786	aa 172/16	PINZA KELLY-RANKIN RECTA 16CM NOPA	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00003503	\N	G185	EDVAMEDICAL E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 21:16:37.461696	2026-06-10 21:16:37.461696	\N	\N	9	20613045440	20613045440
790	300871	FORMO CRESOL X 10 ML	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T025-0003071	\N	504/25	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	\N	BRASIL	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 15:22:59.3007	2026-06-11 15:22:59.3007	\N	\N	9	20613045440	20613045440
791	300270	PARAMONOCLOROFENOL REGULAR X 20ML	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T025-0003071	\N	566/24	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	\N	BRASIL	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 15:23:35.275371	2026-06-11 15:23:35.275371	\N	\N	9	20613045440	20613045440
795	775080	BRAZALETE TENSIOMETRO ADULTO	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000044	\N	775080	A. TARRILLO SA.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 15:54:45.260906	2026-06-11 15:54:45.260906	\N	\N	9	20613045440	20613045440
796	72183	DYCAL FORMULA AVANZADA II	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000044	\N	0000072183	A. TARRILLO SA.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 15:56:00.635434	2026-06-11 15:56:00.635434	\N	\N	9	20613045440	20613045440
799	PM60	OXIMETRO DE PULSO PORTATIL MINDRAY PM60	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	EG07-00001989	\N	CR-3C275446	BIOMEDICAL CARE SYSTEMS S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 20:04:45.755179	2026-06-11 20:04:45.755179	\N	\N	9	20613045440	20613045440
800	PM60	OXIMETRO DE PULSO PORTATIL MINDRAY PM60	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	EG07-00001989	\N	CR-3C275447	BIOMEDICAL CARE SYSTEMS S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 20:05:18.988384	2026-06-11 20:05:18.988384	\N	\N	9	20613045440	20613045440
802	431510	CATETER BALON APERI SC 1.5 X 10 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227467	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:10.192024	2026-06-17 21:47:10.192024	\N	\N	3	20605712241	20605712241
803	431515	CATETER BALON APERI SC 1.5 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227468	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:10.352829	2026-06-17 21:47:10.352829	\N	\N	3	20605712241	20605712241
804	431520	CATETER BALON APERI SC 1.5 X 20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227469	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:10.495508	2026-06-17 21:47:10.495508	\N	\N	3	20605712241	20605712241
805	432010	CATETER BALON APERI SC 2.0 X 10 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227470	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:10.643848	2026-06-17 21:47:10.643848	\N	\N	3	20605712241	20605712241
700	bm-bid-ii30a	BALLOON INFLATION DEVICES	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2508073037	MIRET MEDICAL ASOCIADOS S.A.C. MIRET MED	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:10.143632	2026-06-04 19:41:10.143632	\N	\N	3	20605712241	20605712241
701	hna-035-260	CONGER HYDROPHILIC GUIDE WIRES	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2510227448	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:10.299352	2026-06-04 19:41:10.299352	\N	\N	3	20605712241	20605712241
702	bm-mf2-on	MANIFOLD DE DOS VÍAS	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2510227458	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:10.455867	2026-06-04 19:41:10.455867	\N	\N	3	20605712241	20605712241
703	bm-mf3-on	MANIFOLD	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2510227459	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:10.605544	2026-06-04 19:41:10.605544	\N	\N	3	20605712241	20605712241
704	5575-a3	CATETER HEADHUNTER 1 5F 100CM	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	I3192257	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:10.769168	2026-06-04 19:41:10.769168	\N	\N	3	20605712241	20605712241
705	psi-5f-1103518g	INTRODUCTOR PRELUDE C/AGUJA 5F	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	H3201753	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:10.923509	2026-06-04 19:41:10.923509	\N	\N	3	20605712241	20605712241
706	tscmg-35-260-lesdc	GUIA METALICA LUNDERQUIST CURVA 35 X 260 CM LESDC (12)	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	E4747855	ATILIO PALMIERI S.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:11.076886	2026-06-04 19:41:11.076886	\N	\N	3	20605712241	20605712241
707	h710-fl545	CATHETER 5FR 100CM AMPLAZ AL1 X UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S23F1F104A	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:11.231625	2026-06-04 19:41:11.231625	\N	\N	3	20605712241	20605712241
708	ahw14r001j	ASAHI SION J X UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	250411A101	MULTI MED PERU SAC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:11.395789	2026-06-04 19:41:11.395789	\N	\N	3	20605712241	20605712241
709	evf25008	Evermine50 Coro. Stent System-2.50x08mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH44	MERIL LIFE SCIENCES PVT. LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:11.558165	2026-06-04 19:41:11.558165	\N	\N	3	20605712241	20605712241
710	evf30008	Evermine50 Coro. Stent System-3.00x08mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH18	MERIL LIFE SCIENCES PVT. LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:11.727279	2026-06-04 19:41:11.727279	\N	\N	3	20605712241	20605712241
711	evf40019	Evermine50 Coro. Stent System-4.00x19mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH56	MERIL LIFE SCIENCES PVT. LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:12.043872	2026-06-04 19:41:12.043872	\N	\N	3	20605712241	20605712241
712	evf40024	Evermine50 Coro. Stent System-4.00x24mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	EFH51	MERIL LIFE SCIENCES PVT. LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:12.201066	2026-06-04 19:41:12.201066	\N	\N	3	20605712241	20605712241
713	rsc051125-hw45-ic20-k-s	BrilliantTM Introducer Kit - 5Fr x 11 cm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	202511609	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:12.366217	2026-06-04 19:41:12.366217	\N	\N	3	20605712241	20605712241
714	rsc061125-hw45	BrilliantTM Introducer Kit 6Fr x 11 cm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	202512604	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:12.515272	2026-06-04 19:41:12.515272	\N	\N	3	20605712241	20605712241
715	ob0810t	AGUJA PARA BIOPSIA DE MEDULA OSEA DESCARTABLE 08G X 100MM	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	250139	AID HEALTH CARE S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:12.721269	2026-06-04 19:41:12.721269	\N	\N	3	20605712241	20605712241
716	ob1310t	AGUJA PARA BIOPSIA DE MEDULA OSEA DESCARTABLE 13G X 100MM	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25061779	AID HEALTH CARE S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:12.869197	2026-06-04 19:41:12.869197	\N	\N	3	20605712241	20605712241
717	rsc061125-hw45-ic20-k-s	BRILLIANT INTRODUCER 6FR x 11 CM	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	202510601	LEPU INTERNATIONAL HOLHINGS (SHENZHEN) CO., LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:13.066911	2026-06-04 19:41:13.066911	\N	\N	3	20605712241	20605712241
718	fgtz225036	Sirolimus Eluting Cobalt Chromium Coronary Stent System 2.25 x 36\r\nmm x 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25TZAMMAB	SAHAJANAND MEDICAL TECHNOLOGIES IRELAND LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:13.231245	2026-06-04 19:41:13.231245	\N	\N	3	20605712241	20605712241
719	10001000454	DISPOSITIVO DE INFLADO DE BALON	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	202504042	GLOBAL MED INTERVENTIONAL E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:13.397703	2026-06-04 19:41:13.397703	\N	\N	3	20605712241	20605712241
720	150150350	CATETER DILATACION PTCA ACROSS HP 1.5x15mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A251	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:13.556236	2026-06-04 19:41:13.556236	\N	\N	3	20605712241	20605712241
721	200100350	CATETER DILATACION PTCA ACROSS HP 2.0x10mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A558	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:13.727178	2026-06-04 19:41:13.727178	\N	\N	3	20605712241	20605712241
722	200150350	CATETER DILATACION PTCA ACROSS HP 2.0x15mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A574	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:13.876816	2026-06-04 19:41:13.876816	\N	\N	3	20605712241	20605712241
723	250150350	CATETER DILATACION PTCA ACROSS HP 2.5x15mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A575	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:14.034123	2026-06-04 19:41:14.034123	\N	\N	3	20605712241	20605712241
724	300200350	CATETER DILATACION PTCA ACROSS HP 3.0x20mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A107	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:14.187674	2026-06-04 19:41:14.187674	\N	\N	3	20605712241	20605712241
725	350200350	CATETER DILATACION PTCA ACROSS HP 3.5x20mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	24A643	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:14.3379	2026-06-04 19:41:14.3379	\N	\N	3	20605712241	20605712241
726	350150350	CATETER DILATACION PTCA ACROSS HP 3.5x15mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A553	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:14.506344	2026-06-04 19:41:14.506344	\N	\N	3	20605712241	20605712241
727	400150350	CATETER DILATACION PTCA ACROSS HP 4.0x15mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A554	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:14.657839	2026-06-04 19:41:14.657839	\N	\N	3	20605712241	20605712241
728	hr-3922	GUIA TEFLONADA ANGULADA 0.035"X260 CM X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	LE240966	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:14.815028	2026-06-04 19:41:14.815028	\N	\N	3	20605712241	20605712241
729	h710-fl519	CATETER ANGIOGRAFICO JUDKINS S-AGU. 5F-100CM-JR 3.5	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25A1A101A	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:14.965381	2026-06-04 19:41:14.965381	\N	\N	3	20605712241	20605712241
730	ahw14r017s	ASAHI SION BLUE ES (190) X UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	250409A051	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:15.126888	2026-06-04 19:41:15.126888	\N	\N	3	20605712241	20605712241
731	26402804	CATETER GUIA CORONARIO JR4 S-AGUJER 6F	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2501-0324	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:15.308367	2026-06-04 19:41:15.308367	\N	\N	3	20605712241	20605712241
732	h710-fl521	CATETER ANGIOGRAFICO JUDKINS S-AGU. 5F-100CM-JR4 X\r\n01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25A1A101A	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:15.487746	2026-06-04 19:41:15.487746	\N	\N	3	20605712241	20605712241
733	psi-6f-1103518g	INTRODUCTOR PRELUDE C/AGUJA 6F	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	H3283983	CARDIO PERFUSION EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:15.66188	2026-06-04 19:41:15.66188	\N	\N	3	20605712241	20605712241
734	h710-fl5662	CATETER ANGIOGRAF. MULTIPROPOS.2 AGU. 5F-110CM MPA	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S23E1E111A	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:15.86912	2026-06-04 19:41:15.86912	\N	\N	3	20605712241	20605712241
735	rh*5jr3500m	CAT DIAG OPTITORQUE JR 3.5 5Fr X 100 X 01 UND. (RADIFOCUS OPTITORQUE)	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	250625	CARDIOMED S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:16.046192	2026-06-04 19:41:16.046192	\N	\N	3	20605712241	20605712241
736	rh*5jl3500m	CAT DIAG OPTITORQUE JL 3.5 5Fr X 100 X 01 UND. (RADIFOCUS OPTITORQUE)	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	250624	CARDIOMED S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:16.220522	2026-06-04 19:41:16.220522	\N	\N	3	20605712241	20605712241
737	bid6004	INSUFLADOR DE 30 ML X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	BLS457250201	ENDOMED TECNOLOGHIES S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:16.468769	2026-06-04 19:41:16.468769	\N	\N	3	20605712241	20605712241
738	jhy-if-60	MANOMETRO PARA INSUFLAR BALON DE ACALASIA X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2024110201IF	ENDOMED TECNOLOGHIES S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:16.636542	2026-06-04 19:41:16.636542	\N	\N	3	20605712241	20605712241
739	150200350	CATETER DILATACION PTCA ACROSS HP 1.5x20mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A572	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:16.802785	2026-06-04 19:41:16.802785	\N	\N	3	20605712241	20605712241
740	200200350	CATETER DILATACION PTCA ACROSS HP 2.0x20mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A763	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:16.961531	2026-06-04 19:41:16.961531	\N	\N	3	20605712241	20605712241
741	250100350	CATETER DILATACION PTCA ACROSS HP 2.0x15mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	24A361	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:17.260536	2026-06-04 19:41:17.260536	\N	\N	3	20605712241	20605712241
742	250200350	CATETER DILATACION PTCA ACROSS HP 2.5x20mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A725	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:17.412858	2026-06-04 19:41:17.412858	\N	\N	3	20605712241	20605712241
743	400100350	CATETER DILATACION PTCA ACROSS HP 4.0x10mm	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	25A567	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:17.56403	2026-06-04 19:41:17.56403	\N	\N	3	20605712241	20605712241
744	vdk-if-12	BALON INSUFLADOR KIT	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2025112601IF	ENDOMED TECNOLOGHIES S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:17.726714	2026-06-04 19:41:17.726714	\N	\N	3	20605712241	20605712241
745	apw14r010s	ASAHI SION BLACK 190CM	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	251224A021	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:17.893085	2026-06-04 19:41:17.893085	\N	\N	3	20605712241	20605712241
746	ahw14r004j	ASAHI SION BLUE J	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	251224A041	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:18.051243	2026-06-04 19:41:18.051243	\N	\N	3	20605712241	20605712241
747	ahw14r001s	ASAHI SION	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	251219A191	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:18.226299	2026-06-04 19:41:18.226299	\N	\N	3	20605712241	20605712241
748	h710-fl5122	CATETER ANGIOGRAFICO TORANOMON 5F-110CM-3.5-1 SH X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	S25F1F102A	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:18.397284	2026-06-04 19:41:18.397284	\N	\N	3	20605712241	20605712241
749	rh*5tig110m	CAT DIAG OPTITORQUE TIG 5FR X 100 X 01 UND. (RADIFOCUS OPTITORQUE)	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	250723	CARDIOMED S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:18.556863	2026-06-04 19:41:18.556863	\N	\N	3	20605712241	20605712241
750	rs*r60n10mq	KIT R INTRO FEMORAL 6FR X 10 X 01 UND. (RADIFOCUS OPTITORQUE)	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	250516	CARDIOMED S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:18.712905	2026-06-04 19:41:18.712905	\N	\N	3	20605712241	20605712241
751	rs*r70n10mq	KIT R INTRO FEMORAL 7FR X 10 X 01 UND. (RADIFOCUS OPTITORQUE)	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	250623	CARDIOMED S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:18.870578	2026-06-04 19:41:18.870578	\N	\N	3	20605712241	20605712241
752	at1116	DISPOSITIVO DE INFLADO DE BALON ( BALLOON INFLATION DEVICE)	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	202504042	GLOBAL MED INTERVENTIONAL E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:19.023106	2026-06-04 19:41:19.023106	\N	\N	3	20605712241	20605712241
753	431020	CATETER BALON APERI SC 1.0 X 20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2510227457	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:19.193018	2026-06-04 19:41:19.193018	\N	\N	3	20605712241	20605712241
754	431212	CATETER BALON APERI SC 1.25 X 12 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2510227461	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:19.34851	2026-06-04 19:41:19.34851	\N	\N	3	20605712241	20605712241
755	431215	CATETER BALON APERI SC 1.25 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2510227463	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:19.507401	2026-06-04 19:41:19.507401	\N	\N	3	20605712241	20605712241
756	431220	CATETER BALON APERI SC 1.25X20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	Guía de Remisión Remitente	\N	\N	2510227466	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-04 19:41:19.665367	2026-06-04 19:41:19.665367	\N	\N	3	20605712241	20605712241
766	245152364	ICHROMA FERRITIN CAJA X 25T	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-19881	\N	DFRVCA11	RAPIDIAGNOSTICS S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 16:51:29.123926	2026-06-10 16:51:29.123926	\N	\N	9	20613045440	20613045440
775	R0031C	ONSITE SYPHILIS AB COMBO RAPID TETS CAJA X 30 DET	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00011819	\N	F0331X3F00D	CIA IMPORTADORA AMERICANA S.A.	\N	USA	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 20:14:43.884506	2026-06-10 20:14:43.884506	\N	\N	9	20613045440	20613045440
779	1104150108	URINALYSIS REAGENT STRIPS 11P MISSIONS X 100 T	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	TG01-007443	\N	URS5070060	MONT GROUP SAC	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 20:41:07.214246	2026-06-10 20:41:07.214246	\N	\N	9	20613045440	20613045440
787	7819307023	ACCU-CHEK INSTANT KIT x unidad	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	TTT2-003176	\N	407688	CORPORACION LYACOS E.I.R.L	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 21:33:45.662268	2026-06-10 21:33:45.662268	\N	\N	9	20613045440	20613045440
788	7819382023	ACCU- CHEK INSTANT X 50 TIRAS REACTIVAS TUBO	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	TTT2-003176	\N	304190	CORPORACION LYACOS E.I.R.L	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 21:35:07.165476	2026-06-10 21:35:07.165476	\N	\N	9	20613045440	20613045440
757	2507024820	TENSIOMETRO ANEROIDE EXACTA 1350	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000030	\N	13500000002507024820	TARRILLO BARBA S.A.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 15:27:50.111435	2026-06-10 15:27:50.111435	\N	\N	9	20613045440	20613045440
574	84020004	LANCETAS RETRACTIL ESTERIL 0.8MMX 2.0MM CAJA X 200	LINEAGE	Guía de Remisión Remitente	T001-00007002	\N	F22B123C2	JAMPAR S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-01 20:56:12.543628	2026-06-01 20:56:12.543628	\N	\N	7	20613906895	20613906895
575	dil0014	DILUYENTE DIL-C  X 20 LT	LINEAGE	Guía de Remisión Remitente	T004-00000698	\N	2025111701	LC BIOCORP S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-01 21:09:06.81808	2026-06-01 21:09:06.81808	\N	\N	7	20613906895	20613906895
576	lyc0001	LISANTE LYC-1 X 200 ML	LINEAGE	Guía de Remisión Remitente	T004-00000698	\N	2025090101	LC BIOCORP S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-01 21:09:06.993906	2026-06-01 21:09:06.993906	\N	\N	7	20613906895	20613906895
577	lyc0002	LISANTE LYC-2 X 500 ML	LINEAGE	Guía de Remisión Remitente	T004-00000698	\N	2025112201	LC BIOCORP S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-01 21:09:07.15614	2026-06-01 21:09:07.15614	\N	\N	7	20613906895	20613906895
578	DIL0014	DILUYENTE DIL-C  X 20 LT	LINEAGE	Guía de Remisión Remitente	T004-00000752	\N	2025111701	LC BIOCORP S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-01 21:27:11.448197	2026-06-01 21:27:11.448197	\N	\N	7	20613906895	20613906895
579	DIL0014	DILUYENTE DIL-C  X 20 LT	LINEAGE	Guía de Remisión Remitente	T004-00000794	\N	2024101702	LC BIOCORP S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-01 22:01:23.35705	2026-06-01 22:01:23.35705	\N	\N	7	20613906895	20613906895
580	AGU8556	AGUJA DESCARTABLE 21G X 1 1/2 X 100	LINEAGE	Guía de Remisión Remitente	T001-00075176	\N	20251212	ALCIMAR´S MEDIC S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-02 15:21:13.516098	2026-06-02 15:21:13.516098	\N	\N	7	20613906895	20613906895
581	DIL0014	DILUYENTE DIL-C  X 20 LT	LINEAGE	Guía de Remisión Remitente	T004-00001024	\N	2025121802	LC BIOCORP S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-02 15:29:40.567294	2026-06-02 15:29:40.567294	\N	\N	7	20613906895	20613906895
582	DIL0014	DILUYENTE DIL-C  X 20 LT	LINEAGE	Guía de Remisión Remitente	T004-00001024	\N	2025121802	LC BIOCORP S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-02 15:40:32.459123	2026-06-02 15:40:32.459123	\N	\N	7	20613906895	20613906895
583	1009660J	GUIA CORONARIA 014 BMW UNIVERSAL I 190CM	AFECORP PERU S.A.C	Guía de Remisión Remitente	TM01-00019251	\N	4100272	CARDIO PERFUSION E.I.R.L	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-02 18:00:43.833314	2026-06-02 18:00:43.833314	\N	\N	2	20600124871	20600124871
584	7523-21	CATETER PERFORMA JUDKINS 5F JR 4.0 100CM	AFECORP PERU S.A.C	Guía de Remisión Remitente	TM01-00019251	\N	I3455577	CARDIO PERFUSION E.I.R.L	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-02 21:38:18.681151	2026-06-02 21:38:18.681151	\N	\N	2	20600124871	20600124871
758	2507024821	TENSIOMETRO ANEROIDE EXACTA 1350	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000030	\N	13500000002507024821	TARRILLO BARBA S.A.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 15:27:50.289848	2026-06-10 15:27:50.289848	\N	\N	9	20613045440	20613045440
759	2507024822	TENSIOMETRO ANEROIDE EXACTA 1350	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000030	\N	13500000002507024822	TARRILLO BARBA S.A.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 15:27:50.469182	2026-06-10 15:27:50.469182	\N	\N	9	20613045440	20613045440
760	2507024823	TENSIOMETRO ANEROIDE EXACTA 1350	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000030	\N	13500000002507024823	TARRILLO BARBA S.A.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 15:27:50.833357	2026-06-10 15:27:50.833357	\N	\N	9	20613045440	20613045440
761	2507024824	TENSIOMETRO ANEROIDE EXACTA 1350	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000030	\N	13500000002507024824	TARRILLO BARBA S.A.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 15:27:50.979576	2026-06-10 15:27:50.979576	\N	\N	9	20613045440	20613045440
762	2507024825	TENSIOMETRO ANEROIDE EXACTA 1350	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000030	\N	13500000002507024825	TARRILLO BARBA S.A.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 15:27:51.123065	2026-06-10 15:27:51.123065	\N	\N	9	20613045440	20613045440
763	2507024826	TENSIOMETRO ANEROIDE EXACTA 1350	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000030	\N	13500000002507024826	TARRILLO BARBA S.A.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 15:27:51.302017	2026-06-10 15:27:51.302017	\N	\N	9	20613045440	20613045440
764	2507024827	TENSIOMETRO ANEROIDE EXACTA 1350	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000030	\N	13500000002507024827	TARRILLO BARBA S.A.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 15:27:51.444189	2026-06-10 15:27:51.444189	\N	\N	9	20613045440	20613045440
767	R0042C	ONSITE HBSAG COMBO RAPID TEST CAJA X 30 TEST	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00011722	\N	F1010W1E00D	CIA. IMPORTADORA AMERICANA S.A.	\N	USA	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 17:59:10.326718	2026-06-10 17:59:10.326718	\N	\N	9	20613045440	20613045440
776	TER2027	TERMOMETRO DIGITAL PUNTA FLEXIBLE UNIDAD	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00074329	\N	202503027	ALCIMAR'S MEDIC S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 20:23:21.485978	2026-06-10 20:23:21.485978	\N	\N	9	20613045440	20613045440
780	04014	TARJETA EN GEL ID-LISS/COOMBS CAJA X 48	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00046280	\N	1045824328	DIAGNOSTICA PERUANA S.A.C.	\N	SUIZA	UND	\N	\N	15.00	25.00	\N	1	2026-06-10 21:04:28.150243	2026-06-10 21:04:28.150243	\N	\N	9	20613045440	20613045440
789	302884	LARINGOSCOPIO MILLER-BABY ESTÁNDAR 7070	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T025-0003071	\N	784828	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 15:19:03.63138	2026-06-11 15:19:03.63138	\N	\N	9	20613045440	20613045440
792	302884	LARINGOSCOPIO MILLER-BABY ESTÁNDAR 7070	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T025-0003071	\N	784828	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	\N	BRASIL	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 15:30:00.872697	2026-06-11 15:30:00.872697	\N	\N	9	20613045440	20613045440
793	300871	FORMO CRESOL X 10 ML	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T025-0003071	\N	504/25	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	\N	BRASIL	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 15:30:49.993363	2026-06-11 15:30:49.993363	\N	\N	9	20613045440	20613045440
794	300270	PARAMONOCLOROFENOL REGULAR X 20ML	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T025-0003071	\N	566/24	COMERCIO E INDUSTRIA DENTAL TARRILLO SAC	\N	BRASIL	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 15:31:53.487974	2026-06-11 15:31:53.487974	\N	\N	9	20613045440	20613045440
797	MO14100167	RESUCITADOR MANUAL REUTILIZABLE DE SILICONA CON CORREA DE MANO ADULTO	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000045	\N	MO14100167	DROGUERIA IMPORTADORA ANTONIO´S E.I.R.L.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 19:43:51.20235	2026-06-11 19:43:51.20235	\N	\N	9	20613045440	20613045440
798	MO14060356	RESUCITADOR MANUAL REUTILIZABLE DE SILICONA CON CORREA DE MANO ADULTO	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T001-00000045	\N	MO14060356	DROGUERIA IMPORTADORA ANTONIO´S E.I.R.L.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 19:44:34.728773	2026-06-11 19:44:34.728773	\N	\N	9	20613045440	20613045440
801	TUB0012	TUBO T/VERDE AL VACIO CON HEPARINA DE LITIO 3ML	JR MEDIC E.I.R.L.	Guía de Remisión Remitente	T004-00000108	\N	251210	GRUPO PALMISTA S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-11 20:13:08.67449	2026-06-11 20:13:08.67449	\N	\N	9	20613045440	20613045440
806	432015	CATETER BALON APERI SC 2.0 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227471	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:10.796661	2026-06-17 21:47:10.796661	\N	\N	3	20605712241	20605712241
807	432020	CATETER BALON APERI SC 2.0 X 20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227472	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:10.946389	2026-06-17 21:47:10.946389	\N	\N	3	20605712241	20605712241
808	432510	CATETER BALON APERI SC 2.5 X 10 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227473	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:11.100302	2026-06-17 21:47:11.100302	\N	\N	3	20605712241	20605712241
809	432515	CATETER BALON APERI SC 2.5 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227474	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:11.253144	2026-06-17 21:47:11.253144	\N	\N	3	20605712241	20605712241
810	432520	CATETER BALON APERI SC 2.5 X 20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227475	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:11.400535	2026-06-17 21:47:11.400535	\N	\N	3	20605712241	20605712241
811	433010	CATETER BALON APERI SC 3.0 X 10 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227476	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:11.549082	2026-06-17 21:47:11.549082	\N	\N	3	20605712241	20605712241
812	433020	CATETER BALON APERI SC 3.0 X 20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227477	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:11.69216	2026-06-17 21:47:11.69216	\N	\N	3	20605712241	20605712241
813	433510	CATETER BALON APERI SC 3.5 X 10 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227478	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:11.846285	2026-06-17 21:47:11.846285	\N	\N	3	20605712241	20605712241
814	433515	CATETER BALON APERI SC 3.5 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227479	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:12.004454	2026-06-17 21:47:12.004454	\N	\N	3	20605712241	20605712241
815	434010	CATETER BALON APERI SC 4.0 X 10 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227480	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:12.1486	2026-06-17 21:47:12.1486	\N	\N	3	20605712241	20605712241
816	434015	CATETER BALON APERI SC 4.0 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227481	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:12.376491	2026-06-17 21:47:12.376491	\N	\N	3	20605712241	20605712241
817	434020	CATETER BALON APERI SC 4.0X20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227482	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:12.518915	2026-06-17 21:47:12.518915	\N	\N	3	20605712241	20605712241
818	442015	CATETER BALON APERI NC 2.0 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227483	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:12.664749	2026-06-17 21:47:12.664749	\N	\N	3	20605712241	20605712241
819	442020	CATETER BALON APERI NC 2.0 X 20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227484	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:12.817879	2026-06-17 21:47:12.817879	\N	\N	3	20605712241	20605712241
820	442510	CATETER BALON APERI NC 2.5 X 10 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227485	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:12.967595	2026-06-17 21:47:12.967595	\N	\N	3	20605712241	20605712241
821	442515	CATETER BALON APERI NC 2.5 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227486	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:13.116007	2026-06-17 21:47:13.116007	\N	\N	3	20605712241	20605712241
822	442520	CATETER BALON APERI NC 2.5 X 20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227487	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:13.262915	2026-06-17 21:47:13.262915	\N	\N	3	20605712241	20605712241
823	443010	CATETER BALON APERI NC 3.0 X 10 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227488	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:13.409785	2026-06-17 21:47:13.409785	\N	\N	3	20605712241	20605712241
824	443015	CATETER BALON APERI NC 3.0 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227489	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:13.562109	2026-06-17 21:47:13.562109	\N	\N	3	20605712241	20605712241
825	443020	CATETER BALON APERI NC 3.0 X 20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227490	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:13.718922	2026-06-17 21:47:13.718922	\N	\N	3	20605712241	20605712241
826	443510	CATETER BALON APERI NC 3.5 X 10 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227491	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:13.885472	2026-06-17 21:47:13.885472	\N	\N	3	20605712241	20605712241
827	443515	CATETER BALON APERI NC 3.5 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227492	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:14.034241	2026-06-17 21:47:14.034241	\N	\N	3	20605712241	20605712241
828	443520	CATETER BALON APERI NC 3.5 X 20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227493	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:14.181291	2026-06-17 21:47:14.181291	\N	\N	3	20605712241	20605712241
829	444010	CATETER BALON APERI NC 4.0 X 10 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227494	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:14.324832	2026-06-17 21:47:14.324832	\N	\N	3	20605712241	20605712241
830	444015	CATETER BALON APERI NC 4.0 X 15 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227495	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:14.469718	2026-06-17 21:47:14.469718	\N	\N	3	20605712241	20605712241
831	444020	CATETER BALON APERI NC 4.0 X 20 x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2510227496	BROSMED MEDICAL CO.,LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:14.621587	2026-06-17 21:47:14.621587	\N	\N	3	20605712241	20605712241
832	h74939407s0	SAFARI2 275CM SMALL CURVE (SGL)	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	9952785	BOSTON SCIENTIFIC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:14.777875	2026-06-17 21:47:14.777875	\N	\N	3	20605712241	20605712241
833	ahw14r008p	ASAHI PTCA Guide Wire ASAHI Gaia Second 190 cm X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	250403A261	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:14.944087	2026-06-17 21:47:14.944087	\N	\N	3	20605712241	20605712241
834	hr-3812	GUIA TEFLONADA RECTA 0.035"X 150 CM X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SL240047	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:15.262049	2026-06-17 21:47:15.262049	\N	\N	3	20605712241	20605712241
835	431015	APERI SC BALLOON DILATATION CATHETER 1.0 x 15 MM x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2603201425	BE DAY GROUP S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:15.439703	2026-06-17 21:47:15.439703	\N	\N	3	20605712241	20605712241
836	443012	APERI NC BALLOON DILATATION CATHETER 3.0 x 12 MM x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2603201545	BE DAY GROUP S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:15.616416	2026-06-17 21:47:15.616416	\N	\N	3	20605712241	20605712241
837	443512	APERI NC BALLOON DILATATION CATHETER 3.5 x 12 MM x 01 und	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2603201551	BE DAY GROUP S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:15.772734	2026-06-17 21:47:15.772734	\N	\N	3	20605712241	20605712241
838	26400204	CATETER GUIA CORONARIO AL1 S-AGUJE. 6F AMPLATZ x 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2310-0379	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:15.927473	2026-06-17 21:47:15.927473	\N	\N	3	20605712241	20605712241
839	ap14r025s	GLADIUS EX 14 Straight (200 cm)	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	241111A011	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:16.087399	2026-06-17 21:47:16.087399	\N	\N	3	20605712241	20605712241
840	26407504	CATETER GUIA CORONARIO XB3.5 S - AGUJE 6F EXTRA B-P	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2405-0167	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:16.233274	2026-06-17 21:47:16.233274	\N	\N	3	20605712241	20605712241
841	nvt29035	NAVIGATOR 29.0 x 35MM TRANSCATHETER HEART VALVE DELIVERY SYSTEM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	PMTDF63	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:16.383937	2026-06-17 21:47:16.383937	\N	\N	3	20605712241	20605712241
842	apw14r010j	ASAHI SION BLACK 190CM J X UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	260327A121	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:16.538154	2026-06-17 21:47:16.538154	\N	\N	3	20605712241	20605712241
843	esb2	WITH BALLON (ELECTRODO DE MARCAPASO TRANSVENOSO TEMPORAL 5FR)	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	20260109R	MULTI MED PERU S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:16.683675	2026-06-17 21:47:16.683675	\N	\N	3	20605712241	20605712241
844	nvt27030	NAVIGATOR 27.5 X 30MM TRANSCATHETER HEART VALVE DELIVERY\r\nSYSTEM X 01 UND	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	PMTDF89	MERIL LIFE SCIENCES PVT LTD.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:16.852045	2026-06-17 21:47:16.852045	\N	\N	3	20605712241	20605712241
845	rm*af6j10sqw	KIT A INTRO RADIAL 6Fr x 10 (RADIFOCUS INTRODUCER II)	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	250910	CARDIOMED S.A.C.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:17.016346	2026-06-17 21:47:17.016346	\N	\N	3	20605712241	20605712241
846	bq-9215	KIT ACTP CON INFLACION DE DISPOSITIVOS C-BRAZO	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SL241428	PHS PERUVIAN HOSPITAL SUPPLY E.I.R.L.	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-17 21:47:17.215235	2026-06-17 21:47:17.215235	\N	\N	3	20605712241	20605712241
847	PE40355	VALGANCICLOVIR 450MG TABLETA RECUBIERTA 6X10 - VAGLICAN 450 X UND	\t GLOBAL DRUG PERU S.A.C	Guía de Remisión Remitente	T001-23348	\N	FD254945	SEVEN PHARMA	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-18 15:46:56.662168	2026-06-18 15:46:56.662168	\N	\N	14	20607309478	20607309478
848	44085434	TACROLIMUS 1MG CAJA X 100 TAB	\t GLOBAL DRUG PERU S.A.C	Guía de Remisión Remitente	T104-00001426	\N	RA4539	H REPS S.A.C.	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-18 16:19:53.832431	2026-06-18 16:19:53.832431	\N	\N	14	20607309478	20607309478
873	wml-320	CLIPS DE LIGADURA WEL-LOK MEDIANO GRANDES x Caja	IMPORTACIONES MEDICAS RZ S.A.C.	\N	\N	\N	2025255	EOMEDICA SAC	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	6	20610696571	20610696571
874	s01-l4	OXYGEN MASKS FOR SINGLE USE X 01 UND.	IMPORTACIONES MEDICAS RZ S.A.C.	\N	\N	\N	2601061	QINGDAO HIPROVE MEDICAL TECHNOLOGIES CO.,LTD	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	6	20610696571	20610696571
875	1009660J	GUIA CORONARIA 014 BMW UNIVERSAL I 190CM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	4100272	CARDIO PERFUSION E.I.R.L	\N	PERU	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
876	bm-hv01	Y CONNECTOR SETS  X  01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2506106166	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
877	bm-bid-i30	JERINGA DE ALTA PRESIÓN CON MANÓMETRO DE 20 CC -\r\nBROSMED X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	2511114218	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
878	11510002	CATÉTER PARA DIAGNÓSTICO CORONARIO CURVA \r\nJUDKINS JR4 DE 5 FRENCH	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SP1124092024	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
879	53610009	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA TIPO JUDKINS DERECHA JR4 DE 6 FRENCH X 100 CCM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SP5324091912	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
880	53610002	CATÉTER GUÍA PARA ANGIOPLASTÍA CORONARIA EXTRA BACK UP (XB) 3.5 DE 6 FRENCH X 100 CM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SP5324050510	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
881	hpc480e	CONECTOR DE PRESION 48" 122CM 1200 PSI X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	I3370429	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
882	7523-13	CATETER PERFORMA JUDKINS 5F JR 3.5 X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	I3356253	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
883	iq35f260j3	GUIA INQWIRE 3mm J 0.035” 260 X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	K3371675	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
884	11510005	CATÉTER PARA DIAGNÓSTICO CORONARIO CURVA JUDKINS IZQUIERDA JL3.5 DE 5 FRENCH X 100 CM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SP1124041023	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
885	41350150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA NO COMPLACIENTE DE DIÁMETRO 3.5 MM DE LONGITUD 15 MM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SP4124040324	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
886	41400150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA NO COMPLACIENTE DE DIÁMETRO 4.0 MM DE LONGITUD 15 MM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SP4125080402	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
887	50225150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA SEMICOMPLACIENTE DE DIÁMETRO 2.25 MM X 15 MM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SP5024091403	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
888	50200150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA SEMICOMPLACIENTE DE DIÁMETRO 2 MM X 15 MM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SP5025090304	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
889	41275150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA NO COMPLACIENTE DE\r\nDIÁMETRO 2.75 MM DE LONGITUD 15 MM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SP4125022805	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
890	41300150	CATÉTER BALÓN PARA ANGIOPLASTÍA CORONARIA NO COMPLACIENTE DE DIÁMETRO 3.0 MM DE LONGITUD 15 MM	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	SP4125051505	JOSSON MEDICAL EIRL	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
891	7521-13	CATETER PERFORMA JUDKINS 5F JL3.5 X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	I3356227	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
892	iq35f180j3	GUIA INQWIRE 3mm J 0.035” 180 X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	K3371732	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
893	phr5f11021pw	INTRODUCTOR RADIAL HIDROFILICO PRELUDE EASE 5FR X 11 CM X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	H2735360	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
894	phr6f11021pw	INTRODUCTOR RADIAL HIDROFILICO PRELUDE EASE 6FR X 11 CM X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	H3247331	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
895	12673-05	CIERRE VASCULAR-PROGLIDE X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	6021241	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
896	srb24ac	BANDA COMPRENSORA RADIAL PRELUDE SYNC 24AC X 01 UND.	MIRET MEDICAL ASOCIADOS S.A.C.	\N	\N	\N	I3385327	CARDIO PERFUSION E.I.R.L	\N	\N	UND	\N	\N	15.00	25.00	\N	1	2026-06-19 04:08:24.034656	2026-06-19 04:08:24.034656	\N	\N	3	20605712241	20605712241
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre, descripcion, permisos, activo, created_at) FROM stdin;
1	ADMIN	Administrador del sistema	{}	1	2026-04-11 01:27:38.218174
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, usuario, email, password, rol_id, activo, ultimo_acceso, created_at, updated_at) FROM stdin;
1	Administrador General	admin	admin@sistema.com	$2b$10$CjmvJ0eURmR5yhQL7xSd1.A02HNRBxmoNpj9pb2P03xj2QSQTYg2W	1	1	2026-06-01 04:23:24.643	2026-04-11 01:28:00.561272	2026-06-01 04:23:24.732454
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-03-14 01:54:17
20211116045059	2026-03-14 01:54:19
20211116050929	2026-03-14 01:54:19
20211116051442	2026-03-14 01:54:19
20211116212300	2026-03-14 01:54:19
20211116213355	2026-03-14 01:54:19
20211116213934	2026-03-14 01:54:20
20211116214523	2026-03-14 01:54:20
20211122062447	2026-03-14 01:54:20
20211124070109	2026-03-14 01:54:20
20211202204204	2026-03-14 01:54:20
20211202204605	2026-03-14 01:54:20
20211210212804	2026-03-14 01:54:21
20211228014915	2026-03-14 01:54:21
20220107221237	2026-03-14 01:54:21
20220228202821	2026-03-14 01:54:21
20220312004840	2026-03-14 01:54:22
20220603231003	2026-03-14 01:54:22
20220603232444	2026-03-14 01:54:22
20220615214548	2026-03-14 01:54:22
20220712093339	2026-03-14 01:54:22
20220908172859	2026-03-14 01:54:22
20220916233421	2026-03-14 01:54:22
20230119133233	2026-03-14 01:54:23
20230128025114	2026-03-14 01:54:23
20230128025212	2026-03-14 01:54:23
20230227211149	2026-03-14 01:54:23
2023022818