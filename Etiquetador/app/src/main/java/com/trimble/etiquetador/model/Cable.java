package com.trimble.etiquetador.model;


public class Cable {
    private String tagid;
    private String tipo;
    private String uso;
    private int escable;
    private int operadora;
    private int nhilos;
    private int npares;
    private String operadora_name;

    public Cable(String tagid, String tipo, String uso, int escable, int operadora, int nhilos, int npares, String operadora_name){
        this.tagid = tagid;
        this.tipo = tipo;
        this.uso = uso;
        this.escable = escable;
        this.operadora = operadora;
        this.nhilos = nhilos;
        this.npares = npares;
        this.operadora_name = operadora_name;
    }

    public String getOperadora_name() {
        return operadora_name;
    }

    public int isEscable() {
        return escable;
    }

    public String getTagid() {
        return tagid;
    }

    public int getOperadora() {
        return operadora;
    }

    public String getTipo() {
        return tipo;
    }

    public String getUso() {
        return uso;
    }

    public int getNhilos() {
        return nhilos;
    }

    public int getNpares() {
        return npares;
    }

    public void setEscable(int escable) {
        this.escable = escable;
    }

    public void setOperadora(int operadora) {
        this.operadora = operadora;
    }

    public void setTagid(String tagid) {
        this.tagid = tagid;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public void setUso(String uso) {
        this.uso = uso;
    }

    public void setNhilos(int nhilos) {
        this.nhilos = nhilos;
    }

    public void setNpares(int npares) {
        this.npares = npares;
    }

    public void setOperadora_name(String operadora_name) {
        this.operadora_name = operadora_name;
    }
}
