package com.trimble.etiquetador.model;

/**
 * Created by jorge on 19/1/17.
 */
public class CodeBar {
    private String code;
    private int estado;
    private String rfid;

    public CodeBar(String code, int estado, String rfid){
        this.code=code;
        this.estado=estado;
        this.rfid=rfid;
    }

    public void setCode(String code){
        this.code=code;
    }

    public void setEstado(int estado){
        this.estado=estado;
    }

    public void setRfid(String rfid){ this.rfid=rfid;}

    public String getCode(){
        return code;
    }

    public int getEstado(){ return estado;}

    public String getRfid(){ return rfid;}

}
