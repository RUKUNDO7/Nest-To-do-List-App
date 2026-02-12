CREATE TABLE public.todos (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    status boolean DEFAULT false
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

INSERT INTO public.todos (id, title, status) VALUES
(1, 'Learn Nestjs', true),
(2, 'Learn NextJS', true),
(5, 'Learn NodeJS', true),
(6, 'Learn ExpressJS', true),
(8, 'Learn JavaScript', true),
(10, 'Learn HTML', false),
(7, 'Learn Java', false),
(11, 'Create a project', false);

SELECT setval('public.todos_id_seq', 11, true);

ALTER TABLE ONLY public.todos
ADD CONSTRAINT todos_pkey PRIMARY KEY (id);