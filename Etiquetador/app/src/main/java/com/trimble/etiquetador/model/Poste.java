package com.trimble.etiquetador.model;

import java.io.Serializable;

public class Poste implements Serializable{
    private String codigo;
    private String sector;
    private int _id;
    private int ncables;

    public Poste(String codigo, String sector, int _id, int ncables){
        this.codigo = codigo;
        this.sector = sector;
        this._id = _id;
        this.ncables = ncables;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getSector() {
        return sector;
    }

    public int getId(){ return _id; }

    public int getNcables() {
        return ncables;
    }
    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public void setId(Integer _id) {
        this._id = _id;
    }

    public void setNcables(int ncables) {
        this.ncables = ncables;
    }
}
