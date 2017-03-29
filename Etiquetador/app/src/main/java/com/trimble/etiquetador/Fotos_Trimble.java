package com.trimble.etiquetador;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.widget.ImageButton;

import java.io.File;

public class Fotos_Trimble extends Activity {
    private static final int REQUEST_IMAGE_CAPTURE = 1;
    private static String from;
    private String uuid;
    private File dir;
    private File output1=null;
    private File output2=null;
    private ImageButton fotoposte;
    private ImageButton fotocables;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_fotos__trimble);
        from = "";
        uuid = getIntent().getStringExtra("uuid");
        dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM),"/Etiquetador/");
        dir.mkdirs();
        fotoposte = (ImageButton) findViewById(R.id.fotoposte);
        fotocables = (ImageButton) findViewById(R.id.fotocables);
        output1 = new File(dir,"pos_"+uuid+".jpeg");
        output2 = new File(dir,"cab_"+uuid+".jpeg");
        if(output1.exists()){
            fotoposte.setBackgroundResource(R.drawable.poste_taken);
        }
        if(output2.exists()){
            fotocables.setBackgroundResource(R.drawable.rope96_taken);
        }
    }

    public void takePicturePoste(View view){
        Intent takePictureIntent=new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
            from = "poste";
            output1=new File(dir, "pos_"+uuid+".jpeg");
            takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(output1));
            startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
        }
    }

    public void takePictureCables(View view){
        Intent takePictureIntent=new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
            from = "cables";
            output2=new File(dir, "cab_"+uuid+".jpeg");
            takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(output2));
            startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_IMAGE_CAPTURE && resultCode == RESULT_OK) {
            //Bundle extras = data.getExtras();
            //Bitmap imageBitmap = (Bitmap) extras.get("data");
            Intent i=new Intent(Intent.ACTION_VIEW);
            if(from.equals("poste")){
                i.setDataAndType(Uri.fromFile(output1), "image/jpeg");
                fotoposte.setBackgroundResource(R.drawable.poste_taken);
            }
            else if(from.equals("cables")){
                i.setDataAndType(Uri.fromFile(output2), "image/jpeg");
                fotocables.setBackgroundResource(R.drawable.rope96_taken);
        }
        }
    }
    @Override
    public void onBackPressed()
    {
        super.onBackPressed();
        startActivity(new Intent(this, InfoPoste.class));
        finish();
    }

}


