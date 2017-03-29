package com.trimble.etiquetador;

import android.app.Activity;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.graphics.PorterDuff;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.AlphaAnimation;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.AdapterView;
import android.widget.EditText;
import android.widget.ListAdapter;
import android.widget.ListView;
import android.widget.SimpleCursorAdapter;
import android.widget.TextView;
import android.widget.Toast;
import android.content.Intent;

import com.trimble.etiquetador.adapters.PosteAdapter;
import com.trimble.etiquetador.model.Poste;
import com.trimble.etiquetador.DataBaseHelper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ListadoPostes extends Activity {
    private DataBaseHelper myDbHelper;
    private ArrayList<Poste> postes = new ArrayList<Poste>();
    private PosteAdapter posteadapter;
    private InputMethodManager inputManager;
    private AlphaAnimation buttonClick = new AlphaAnimation(1F, 0.4F);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_listado_postes);
        final ListView listviewPoste = (ListView) findViewById(R.id.lista);
        myDbHelper = new DataBaseHelper(this);
        try {
            myDbHelper.openDataBase();
        }catch(SQLException sqle){
            Log.w("Database",sqle.getMessage());
        }
        posteadapter = new PosteAdapter(this,postes);
        listviewPoste.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position,long id) {
                Intent intent = new Intent(ListadoPostes.this, InfoPoste.class);
                Poste tmpposte = postes.get(position);
                intent.putExtra("IdPoste", tmpposte.getId());
                intent.putExtra("CodigoPoste",tmpposte.getCodigo());
                intent.putExtra("Sector",tmpposte.getSector());
                intent.putExtra("NCables",tmpposte.getNcables());
                intent.putExtra("Ventana","listado");
                intent.putExtra("uuid",tmpposte.getUuid());
                postes.clear();
                posteadapter.notifyDataSetChanged();
                SQLiteDatabase db = myDbHelper.getReadableDatabase();
                String mySql = "UPDATE postes SET estado = 1 WHERE _id = "+tmpposte.getId()+";";
                db.execSQL(mySql);
                db.close();
                startActivity(intent);
                finish();
            }
        });
        listviewPoste.setAdapter(posteadapter);
        inputManager = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        (findViewById(R.id.posteid)).getBackground().mutate().setColorFilter(getResources().getColor(R.color.white), PorterDuff.Mode.SRC_ATOP);
        ((TextView) findViewById(R.id.posteid)).setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    postes.clear();
                    posteadapter.notifyDataSetChanged();
                    String posteid = v.getText().toString();
                    if(!posteid.equals("")){
                        SQLiteDatabase db = myDbHelper.getReadableDatabase();
                        String mySql = "SELECT * FROM postes WHERE codigoposte = '"+posteid.toUpperCase()+"' AND estado = 0;";
                        Cursor c = db.rawQuery(mySql, null);
                        try{
                            c.moveToFirst();
                            inputManager.hideSoftInputFromWindow(getCurrentFocus().getWindowToken(),InputMethodManager.HIDE_NOT_ALWAYS);
                            posteadapter.notifyDataSetChanged();
                            do{
                                postes.add(new Poste(c.getString(c.getColumnIndex("codigoposte")), c.getString(c.getColumnIndex("alimentador")),c.getInt(c.getColumnIndex("_id")),c.getInt(c.getColumnIndex("ncables")), c.getString(c.getColumnIndex("uuid"))));
                                c.moveToNext();
                            }while(!c.isAfterLast());

                        }
                        catch (android.database.CursorIndexOutOfBoundsException e){
                            Toast toast = Toast.makeText(ListadoPostes.this,"Código del poste no encontrado",Toast.LENGTH_SHORT);
                            toast.setGravity(Gravity.TOP| Gravity.LEFT, 50, 230);
                            toast.show();
                            postes.clear();
                            posteadapter.notifyDataSetChanged();
                        }
                        c.close();
                        db.close();}
                }
                return false;
            }
        });
    }

    @Override
    public void onBackPressed()
    {
        super.onBackPressed();
        myDbHelper.close();
        startActivity(new Intent(this, Menu.class));
        finish();

    }

    public void registrarNuevoPoste(View view){
        view.startAnimation(buttonClick);
        myDbHelper.close();
        Intent intent = new Intent(this, RegistrarPoste.class);
        startActivity(intent);
        finish();
    }


}
