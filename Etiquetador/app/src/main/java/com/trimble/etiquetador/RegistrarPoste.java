package com.trimble.etiquetador;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.location.GpsStatus;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import com.trimble.etiquetador.model.Position;
import com.trimble.etiquetador.model.Poste;

import org.osgeo.proj4j.*;

import java.util.ArrayList;

import static com.trimble.mcs.barcode.v1.SettingsBase.mContext;

public class RegistrarPoste extends Activity {
    private String[] sectores;
    private Spinner spinnersector;
    private LocationManager locationManager;
    public String GPSstatus;
    private DataBaseHelper myDbHelper;
    private LocationListener locationListener;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registrar_poste);
        this.sectores = new String[] {
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
                "VENEZUELA",
                "NO ESTA EN LISTA"
        };
        spinnersector = (Spinner) findViewById(R.id.spinnerSector);
        ArrayAdapter<String> adapterSector = new ArrayAdapter<String>(this,android.R.layout.simple_spinner_item, sectores);
        spinnersector.setAdapter(adapterSector);
//        gpsWorker = new GpsWorker(this);
//        gpsWorker.init();
        locationManager = (LocationManager)getSystemService(Context.LOCATION_SERVICE);
        locationListener = new MyLocationListener();
        locationManager.addGpsStatusListener(mGPSStatusListener);
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, locationListener);
    }
    public void registrarPoste(View view){
        myDbHelper = new DataBaseHelper(this);
        myDbHelper.openDataBase();
        SQLiteDatabase db = myDbHelper.getReadableDatabase();
        EditText viewcodigoposte = (EditText) findViewById(R.id.codigoposte);
        final String codigoposte = viewcodigoposte.getText().toString();
        if(!codigoposte.equals("")){
            Cursor c = db.rawQuery("SELECT * FROM postes WHERE posteid = '"+codigoposte.toUpperCase()+"';", null);
            if(c.getCount() != 0){
                final ArrayList<Poste> postes = new ArrayList<Poste>();
                c.moveToFirst();
                do{
                    postes.add(new Poste(c.getString(c.getColumnIndex("posteid")), c.getString(c.getColumnIndex("alimentador")),c.getInt(c.getColumnIndex("_id")),c.getInt(c.getColumnIndex("ncables"))));
                    c.moveToNext();
                }while(!c.isAfterLast());
                c.close();
                db.close();
                new AlertDialog.Builder(this)
                        .setTitle("Código de poste repetido")
                        .setMessage("Ya existen postes con el código ingresado.\n¿Desea editar un poste repetido?")
                        .setIcon(android.R.drawable.ic_dialog_alert)
                        .setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int whichButton) {
                                Intent intent = new Intent(RegistrarPoste.this,ListadoRepetidos.class);
                                intent.putExtra("postes",postes);
                                startActivity(intent);
                            }})
                        .setNegativeButton(android.R.string.no, null).show();
            }
            else{
                if ( !locationManager.isProviderEnabled( LocationManager.GPS_PROVIDER ) ) {
                    Toast toast = Toast.makeText(this,"GPS no detectado, está apagado?",Toast.LENGTH_SHORT);
                    toast.setGravity(Gravity.TOP| Gravity.LEFT, 40, 380);
                    toast.show();
                }
                else {
                    if (GPSstatus.equals("GPS_LOCKED")) {
                        Location currentLocation = locationManager.getLastKnownLocation(locationManager.GPS_PROVIDER);
                        Position currentPosition = new Position(currentLocation.getLongitude(), currentLocation.getLatitude());
                        String csName = "EPSG:32717";
                        CoordinateTransformFactory ctFactory = new CoordinateTransformFactory();
                        CRSFactory csFactory = new CRSFactory(this);
                        CoordinateReferenceSystem crs = csFactory.createFromName(csName);
                        final String WGS84_PARAM = "+title=long/lat:WGS84 +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees";
                        CoordinateReferenceSystem WGS84 = csFactory.createFromParameters("WGS84", WGS84_PARAM);
                        CoordinateTransform trans = ctFactory.createTransform(WGS84, crs);
                        ProjCoordinate p = new ProjCoordinate();
                        ProjCoordinate p2 = new ProjCoordinate();
                        p.x = currentPosition.getX();
                        p.y = currentPosition.getY();
                        trans.transform(p, p2);
                        String alimentador = spinnersector.getSelectedItem().toString();
                        String sql = "INSERT INTO postes (posteid,alimentador,x,y,usuario,estado) VALUES('"+codigoposte.toUpperCase()+"','"+alimentador+"',"+p2.x+","+p2.y+",'cnel',1);";
                        db.execSQL(sql);
                        c = db.rawQuery("SELECT * FROM postes WHERE posteid = '"+codigoposte.toUpperCase()+"';", null);
                        c.moveToFirst();
                        int idposte = c.getInt(c.getColumnIndex("_id"));
                        c.close();
                        db.close();
                        locationManager.removeUpdates(locationListener);
                        Intent intent = new Intent(RegistrarPoste.this, InfoPoste.class);
                        intent.putExtra("IdPoste", idposte);
                        intent.putExtra("CodigoPoste",codigoposte.toUpperCase());
                        intent.putExtra("Sector",alimentador);
                        intent.putExtra("NCables",0);
                        startActivity(intent);
                        Log.w("Position",p2.x+","+p2.y);

                    } else if (GPSstatus.equals("GPS_SEARCHING")) {
                        Toast toast = Toast.makeText(this, "Buscando su posición GPS...", Toast.LENGTH_SHORT);
                        toast.setGravity(Gravity.TOP | Gravity.LEFT, 70, 380);
                        toast.show();
                    } else if (GPSstatus.equals("GPS_STOPPED")) {
                        Toast toast = Toast.makeText(this, "El GPS se detuvo", Toast.LENGTH_SHORT);
                        toast.setGravity(Gravity.TOP | Gravity.LEFT, 40, 380);
                        toast.show();
                    } else {
                        Log.w("ERROR", GPSstatus);
                    }
                }
            }
            c.close();
            db.close();
        }
        else{
            Toast toast = Toast.makeText(this,"No se permite ingresar código vacio",Toast.LENGTH_SHORT);
            toast.setGravity(Gravity.TOP| Gravity.LEFT, 40, 380);
            toast.show();
        }
    }

    public void regresarListadoPostes(View view){
        locationManager.removeUpdates(locationListener);
        Intent intent = new Intent(this, ListadoPostes.class);
        startActivity(intent);
    }

    private class MyLocationListener implements LocationListener {
        @Override
        public void onLocationChanged(final Location loc) {
        }

        @Override
        public void onProviderDisabled(String provider) {}

        @Override
        public void onProviderEnabled(String provider) {}

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {}
    }

    public GpsStatus.Listener mGPSStatusListener = new GpsStatus.Listener() {
        public void onGpsStatusChanged(int event) {
            switch(event) {
                case GpsStatus.GPS_EVENT_STARTED:
                    GPSstatus = "GPS_SEARCHING";
                    break;
                case GpsStatus.GPS_EVENT_STOPPED:
                    GPSstatus = "GPS_STOPPED";
                    break;
                case GpsStatus.GPS_EVENT_FIRST_FIX:
                    GPSstatus = "GPS_LOCKED";
                    break;
                case GpsStatus.GPS_EVENT_SATELLITE_STATUS:
                    break;
            }
        }
    };
}
