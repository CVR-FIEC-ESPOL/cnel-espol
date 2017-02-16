create table auth
(
    user_id            varchar(16),
    access_key         varchar(64),
    service_version    varchar(8),
    constraint auth_pk primary key (user_id))
/
