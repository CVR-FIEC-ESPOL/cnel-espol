create table auth
(
    user_id            varchar2(16) not null,
    access_key         varchar2(64) not null,
    service_version    varchar2(8),
    operadora          varchar2(32),
    constraint auth_pk primary key (user_id),
    constraint auth_operadoras_fk foreign key (operadora) references operadoras(operadora))
/
