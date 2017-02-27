create table poste_extras
(
    sid                number(10),
    poste_id           number(10),
    ncables            number(4),
    coord_x            number(19,8),
    coord_y            number(19,8),
    operadora          varchar2(64),
    constraint poste_extras_pk primary key (sid))
/
