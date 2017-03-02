create table poste_extras
(
    poste_id           varchar2(38) not null,
    poste_objectid     number(10) not null,
    poste_codigo       varchar2(254),
    ncables            number(4),
    coord_x            number(19,8),
    coord_y            number(19,8),
    constraint poste_extras_pk primary key (poste_id),
    constraint poste_extras_ncables_ck check (ncables >= 0))
/
-- Add comments to the columns 
comment on column poste_extras.poste_codigo
    is 'this is the observacio field in the postes table, e.g., P090007'
/
