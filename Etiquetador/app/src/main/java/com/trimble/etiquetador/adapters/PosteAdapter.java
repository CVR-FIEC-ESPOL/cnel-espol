package com.trimble.etiquetador.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import com.trimble.etiquetador.R;
import com.trimble.etiquetador.model.Poste;
import java.util.ArrayList;

public class PosteAdapter extends ArrayAdapter<Poste> {
    private ArrayList<Poste> postes;
    private Context context;

    public PosteAdapter(Context context, ArrayList<Poste> postes){
        super(context,0,postes);
        this.context = context;
        this.postes = postes;
    }

    static class ViewHolder{
        public TextView codigo;
        public TextView sector;
    }
    @Override
    public View getView(int position, View convertView, ViewGroup parent){
        if(convertView == null){
            convertView = LayoutInflater.from(context).inflate(R.layout.poste_item,parent,false);
            ViewHolder viewHolder = new ViewHolder();
            viewHolder.codigo = (TextView) convertView.findViewById(R.id.viewcodigo);
            viewHolder.sector = (TextView) convertView.findViewById(R.id.viewsector);
            convertView.setTag(viewHolder);
        }
        ViewHolder holder = (ViewHolder) convertView.getTag();
        final Poste currentPoste = this.postes.get(position);
        holder.codigo.setText(currentPoste.getCodigo());
        holder.sector.setText(currentPoste.getSector());
        return convertView;
    }
}
