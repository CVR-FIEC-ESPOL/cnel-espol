create table cabequip
(
    TAG          varchar2(16) not null,
    RFID         varchar2(32),
    POSTE_ID     varchar2(38),
    OPERADORA    varchar2(32),
    TIPO         varchar2(64),
    CAPACIDAD    number(4),
    USO          varchar2(32) default 'DISTRIBUCION' not null,
    DIMENSIONES  varchar2(64),
    ACTIVO       varchar2(1),
    ES_CABLE     varchar2(1) not null,
    constraint cabequip_pk primary key (tag),
    constraint cabequip_poste_extras_fk foreign key (poste_id) references poste_extras(poste_id),
    constraint cabequip_operadoras_fk foreign key (operadora) references operadoras(operadora),
    constraint cabequip_tipo_ck check (tipo in ('FIBRA', 'RG500', 'MULTIPAR')),
    constraint cabequip_uso_ck check (uso in ('ACOMETIDA', 'DISTRIBUCION')),
    constraint cabequip_activo_ck check (activo in ('S', 'N')),
    constraint cabequip_es_cable_ck check (es_cable in ('S', 'N')))
/
-- Add comments to the columns 
comment on column cabequip.tipo
    is 'At march 2017, 3 types are available, i.e., fibra, rg500, multipar. In the future, you can disable this constraint with "ALTER TABLE CABEQUIP DISABLE CONSTRAINT CABEQUIP_TIPO_CK", or you can add more types to the constraint by dropping the constraint with "ALTER TABLE CABEQUIP DROP CONSTRAINT CABEQUIP_TIPO_CK", and then creating it with "ALTER TABLE CABEQUIP ADD CONSTRAINT CABEQUIP_TIPO_CK CHECK (TIPO IN (<values separated by commas>))"';

comment on column cabequip.capacidad
    is 'this is the capacity according to the TIPO field. CAPACIDAD has the number of hilos for FIBRA, or the number of pares for MULTIPAR. CAPACIDAD has no value for RG500'
/
