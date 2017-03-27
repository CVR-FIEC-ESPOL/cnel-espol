package com.trimble.etiquetador;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import com.trimble.etiquetador.model.Poste;

import java.util.ArrayList;

public class RegistrarPoste extends Activity {
    private String[] sectores;
    private Spinner spinnersector;
    private DataBaseHelper myDbHelper;
    private AlphaAnimation buttonClick = new AlphaAnimation(1F, 0.4F);
    private static final String MyPREFERENCES = "LoginCNEL" ;
    private String user;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registrar_poste);
        this.sectores = new String[] {
                "NO ESTA EN LISTA",
                "10 DE AGOSTO",
                "25 DE JULIO",
                "4 DE NOVIEMBRE",
                "ABDON CALDERON",
                "ACACIAS",
                "ACERIAS",
                "ACUARELA",
                "AEROPUERTO",
                "AGUIRRE",
                "AGUSTIN FREIRE",
                "ALBONOR",
                "ALBORADA",
                "ALFARO",
                "ANTEPARA",
                "ANTONIO PARRA",
                "ATARAZANA 1",
                "ATARAZANA 2",
                "ATARAZANA 3",
                "AV. DEL EJERCITO",
                "BARRIO LINDO",
                "BASTION",
                "BELO HORIZONTE",
                "BENJAMIN CARRION",
                "BOSQUES DE LA COSTA",
                "CALIFORNIA 1",
                "CALIFORNIA 2",
                "CALIXTO ROMERO",
                "CAMINO A LOS VERGELES",
                "CAPEIRA",
                "CARLOS JULIO",
                "CARTONERA",
                "CEIBOS",
                "CEIBOS NORTE",
                "CELOPLAST",
                "CENTRO PARK",
                "CENTRUM",
                "CERRO AZUL",
                "CERRO BLANCO 4",
                "CHILE",
                "CHONGON",
                "COBRE",
                "COLINAS AL SOL",
                "COLON",
                "COMEGUA",
                "CORDOVA",
                "CORONEL",
                "COUNTRY CLUB",
                "COVIEM",
                "CUBA",
                "CUMBRES 4",
                "DEL MAESTRO",
                "DELTA",
                "DOMINGO COMIN",
                "EL CHORRILLO",
                "EL CISNE",
                "EL FORTIN",
                "EL FORTIN ESTE",
                "EL FORTIN OESTE",
                "EL ORO",
                "EL SALADO",
                "EL UNIVERSO",
                "ESMERALDAS",
                "EXPOGRANOS",
                "FADESA",
                "FCO. SEGURA",
                "FERTISA",
                "FLOR DE BASTION 4",
                "FLOR DE BASTION 5",
                "FLOR DE BASTION ESTE",
                "FLOR DE BASTION NORTE",
                "FLOR DE BASTION OESTE",
                "FLORESTA",
                "GARZOTA 4",
                "GERANIOS",
                "GRAN MANZANA",
                "GUASMO CENTRO",
                "GUASMO SUR",
                "GUAYACANES 1",
                "GUAYACANES 3",
                "GUAYACANES 4",
                "HUANCAVILCA",
                "HURTADO",
                "ISIDRO AYORA",
                "JOSE CASTILLO",
                "JOSE MASCOTE",
                "KENNEDY",
                "LA CHALA",
                "LA SAIBA",
                "LAS CAMARAS",
                "LAS TEJAS",
                "LIMONCOCHA",
                "LOMAS",
                "LOS ALAMOS",
                "LOS ANGELES",
                "LOS ESTEROS",
                "LOS RANCHOS",
                "LOS ROSALES",
                "LUQUE",
                "MAGISTERIO",
                "MALECON",
                "MALL DEL SUR",
                "MAPASINGUE 1",
                "MAPASINGUE 2",
                "MAPASINGUE 3",
                "MAPASINGUE 4",
                "MAPASINGUE 5",
                "MAPASINGUE 6",
                "MAPASINGUE 7",
                "MAPASINGUE 8",
                "MENDIBURO",
                "METROPOLIS",
                "MIGUEL H. ALCIVAR",
                "MIRAFLORES",
                "MUCHO LOTE",
                "NORTE",
                "NUEVA BOYACA",
                "ODEBRECHT",
                "OLIMPO",
                "PADRE SOLANO",
                "PAJARO AZUL",
                "PANAMA",
                "PARQUE CALIFORNIA",
                "PASCUALES",
                "PICHINCHA",
                "PLAZA DANIN",
                "PLAZA DEL SOL",
                "PORTAL AL SOL",
                "PORTUARIA 4",
                "PREVISORA",
                "PUERTO AZUL",
                "PUERTO HONDO",
                "PUERTO SANTA ANA 2",
                "QUISQUIS",
                "RIVER FRONT",
                "ROCAFUERTE",
                "ROSAVIN",
                "RUMICHACA",
                "SAMANES 3",
                "SAMANES 6",
                "SAN EDUARDO",
                "SANTA CECILIA",
                "SATIRION",
                "SAUCES 1",
                "SAUCES 2",
                "SAUCES 3",
                "SAUCES 4",
                "SAUCES 5",
                "SUBURBIO 1",
                "SUBURBIO 2",
                "SUBURBIO 3",
                "SUBURBIO 4",
                "SUBURBIO 5",
                "SUBURBIO 6",
                "TANCA MARENGO",
                "TENIENTE HUGO ORTIZ",
                "THE POINT",
                "TORRE 1",
                "TORRE 2",
                "TORRE 3",
                "TORRE 4",
                "TORRE 5",
                "TORRE 6",
                "TRINITARIA 1(NORTE)",
                "TRINITARIA 2(SUR)",
                "TRINITARIA 4",
                "TRUJILLO",
                "TULCAN",
                "UNION DE BANANEROS",
                "URDENOR",
                "URDESA",
                "VALDIVIA",
                "VALLE ALTO",
                "VELEZ",
                "VENEZUELA"
        };
        spinnersector = (Spinner) findViewById(R.id.spinnerSector);
        ArrayAdapter<String> adapterSector = new ArrayAdapter<String>(this,android.R.layout.simple_spinner_item, sectores);
        spinnersector.setAdapter(adapterSector);
        SharedPreferences sharedpreferences = getSharedPreferences(MyPREFERENCES, Context.MODE_PRIVATE);
        user = sharedpreferences.getString("user","");
    }
    public void registrarPoste(View view){
        view.startAnimation(buttonClick);
        myDbHelper = new DataBaseHelper(this);
        myDbHelper.openDataBase();
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        EditText viewcodigoposte = (EditText) findViewById(R.id.codigoposte);
        final String codigoposte = viewcodigoposte.getText().toString().toUpperCase();
        Cursor c = db.rawQuery("SELECT * FROM postes WHERE codigoposte = '"+codigoposte+"';", null);
        if(c.getCount() > 0 && !codigoposte.isEmpty()){
            final ArrayList<Poste> postes = new ArrayList<Poste>();
            c.moveToFirst();
            do{
                postes.add(new Poste(c.getString(c.getColumnIndex("codigoposte")), c.getString(c.getColumnIndex("alimentador")),c.getInt(c.getColumnIndex("_id")),c.getInt(c.getColumnIndex("ncables")), c.getString(c.getColumnIndex("uuid"))));
                c.moveToNext();
            }while(!c.isAfterLast());
            c.close();
            db.close();
            new AlertDialog.Builder(this)
                    .setTitle("Código de poste repetido")
                    .setMessage("Existen postes con el código ingresado.\n¿Desea editarlo?")
                    .setIcon(android.R.drawable.ic_dialog_alert)
                    .setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int whichButton) {
                            Intent intent = new Intent(RegistrarPoste.this,ListadoRepetidos.class);
                            intent.putExtra("postes",postes);
                            startActivity(intent);
                            finish();
                        }})
                    .setNegativeButton(android.R.string.no, null).show();
        }
        else{
            String alimentador = spinnersector.getSelectedItem().toString();
            String sql = "INSERT INTO postes (codigoposte,alimentador,usuario,estado) VALUES('"+codigoposte+"','"+alimentador+"','"+user+"',1);";
            db.execSQL(sql);
            c = db.rawQuery("SELECT * FROM postes WHERE codigoposte = '"+codigoposte+"';", null);
            c.moveToFirst();
            int idposte = c.getInt(c.getColumnIndex("_id"));
            c.close();
            db.close();
            Intent intent = new Intent(RegistrarPoste.this, InfoPoste.class);
            intent.putExtra("IdPoste", idposte);
            intent.putExtra("CodigoPoste",codigoposte);
            intent.putExtra("Sector",alimentador);
            intent.putExtra("NCables",0);
            intent.putExtra("Ventana","listado");
            myDbHelper.close();
            startActivity(intent);
            finish();
            }
    }

    @Override
    public void onBackPressed()
    {
        super.onBackPressed();
        startActivity(new Intent(this, ListadoPostes.class));
        finish();
    }
}
