CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying(120) NOT NULL,
    email character varying(255) NOT NULL UNIQUE,
    password text NOT NULL,
    role character varying(20) NOT NULL DEFAULT 'user',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.todos (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    status boolean DEFAULT false,
    user_id uuid NOT NULL,
    CONSTRAINT todos_pkey PRIMARY KEY (id),
    CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE SEQUENCE public.todos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.todos_id_seq OWNED BY public.todos.id;

ALTER TABLE ONLY public.todos 
ALTER COLUMN id SET DEFAULT nextval('public.todos_id_seq'::regclass);
