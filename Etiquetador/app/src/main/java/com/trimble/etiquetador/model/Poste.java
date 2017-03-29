package com.trimble.etiquetador.model;

import java.io.Serializable;

public class Poste implements Serializable{
    private String codigo;
    private String sector;
    private int _id;
    private int ncables;
    private int ncdds, nmangas, ntaps;
    private String uuid;

    public Poste(String codigo, String sector, int _id, int ncables, String uuid){
        this.codigo = codigo;
        this.sector = sector;
        this._id = _id;
        this.ncables = ncables;
        this.uuid = uuid;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getUuid() {
        return uuid;
    }

    public String getSector() {
        return sector;
    }

    public int getId(){ return _id; }

    public int getNcables() {
        return ncables;
    }

    public int getNcdds() {
        return ncdds;
    }

    public int getNmangas() {
        return nmangas;
    }

    public int getNtaps() {
        return ntaps;
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

    public void setNcdds(int ncdds) {
        this.ncdds = ncdds;
    }

    public void setNmangas(int nmangas) {
        this.nmangas = nmangas;
    }

    public void setNtaps(int ntaps) {
        this.ntaps = ntaps;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }
}
