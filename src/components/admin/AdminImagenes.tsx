"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import type { Producto } from "@/src/types/producto";
import { productId, variantId } from "@/src/lib/productIdentity";

type ProductoAdmin = Producto & { _ImagenAnterior?: string; _ImagenOrigen?: "especifica"|"general"|"anterior"|"sin-imagen"; _ProductId?: string; _VariantId?: string };
type RegistryImage = { publicId:string; version:number };
type Registry = { products:Record<string,RegistryImage>; variants:Record<string,RegistryImage>; revision:number };

const VACIO: Registry = { products:{}, variants:{}, revision:0 };

function etiqueta(v: ProductoAdmin) {
  return [v.Tamaño, v.Color, v.Fragancias, v.Aromas].map(x=>String(x||"").trim()).filter(Boolean).join(" · ") || "Producto";
}
function origen(v: ProductoAdmin, registry: Registry) {
  const vid=variantId(v), pid=productId(v);
  if(registry.variants[vid]) return "ESPECÍFICA";
  if(registry.products[pid]) return "GENERAL";
  if(v._ImagenAnterior) return "ANTIGUA";
  return "SIN IMAGEN";
}
function managedUrl(img?: RegistryImage) {
  if(!img) return "";
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "equm866o";
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,c_limit,w_500/v${img.version}/${img.publicId}`;
}
function imagenEfectiva(v: ProductoAdmin, registry: Registry) {
  const img=registry.variants[variantId(v)] || registry.products[productId(v)];
  return managedUrl(img) || v._ImagenAnterior || v.Imagen || "";
}

export default function AdminImagenes({ autorizadoInicial }: { autorizadoInicial:boolean }) {
  const [autorizado,setAutorizado]=useState(autorizadoInicial), [password,setPassword]=useState(""), [error,setError]=useState("");
  const [productos,setProductos]=useState<ProductoAdmin[]>([]), [registry,setRegistry]=useState<Registry>(VACIO), [buscar,setBuscar]=useState("");
  const [abierto,setAbierto]=useState<string|null>(null), [seleccion,setSeleccion]=useState<Record<string,Set<string>>>({});
  const [ocupado,setOcupado]=useState(""), [mensaje,setMensaje]=useState("");
  const inputGeneral=useRef<HTMLInputElement>(null), inputVariantes=useRef<HTMLInputElement>(null), targetRef=useRef<{pid:string; vids:string[]; target:"product"|"variants"}|null>(null);

  async function cargar() {
    const [rp,ri]=await Promise.all([fetch("/api/productos",{cache:"no-store"}),fetch("/api/admin/images",{cache:"no-store"})]);
    if(!rp.ok) throw new Error("No se pudieron cargar los productos");
    const parsed=Papa.parse<ProductoAdmin>(await rp.text(),{header:true,skipEmptyLines:true});
    setProductos(parsed.data.filter(p=>String(p.Nombre||"").trim()));
    if(ri.ok) setRegistry(await ri.json());
  }
  useEffect(()=>{if(autorizado)cargar().catch(e=>setError(e.message));},[autorizado]);

  const grupos=useMemo(()=>{
    const q=buscar.toLowerCase().trim(), mapa=new Map<string,ProductoAdmin[]>();
    for(const p of productos){
      const texto=[p.Marca,p.Linea,p.Nombre,p.Categoría,p.Subcategoría,p.Tamaño,p.Color,p.Fragancias,p.Aromas].join(" ").toLowerCase();
      if(q&&!texto.includes(q))continue;
      const id=productId(p); mapa.set(id,[...(mapa.get(id)||[]),p]);
    }
    return [...mapa.entries()];
  },[productos,buscar]);

  async function login(e:React.FormEvent){e.preventDefault();setError("");const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});if(!r.ok){setError("Contraseña incorrecta");return}setAutorizado(true);setPassword("")}
  function seleccionados(pid:string){return seleccion[pid]||new Set<string>()}
  function toggle(pid:string,vid:string){setSeleccion(s=>{const n=new Set(s[pid]||[]);n.has(vid)?n.delete(vid):n.add(vid);return {...s,[pid]:n}})}
  function seleccionarTodos(pid:string,items:ProductoAdmin[]){setSeleccion(s=>({...s,[pid]:new Set(items.map(variantId))}))}
  function limpiar(pid:string){setSeleccion(s=>({...s,[pid]:new Set()}))}

  function pedirArchivo(pid:string,vids:string[],target:"product"|"variants"){
    targetRef.current={pid,vids,target}; (target==="product"?inputGeneral:inputVariantes).current?.click();
  }
  async function subir(file?:File){
    const t=targetRef.current;if(!file||!t)return;setOcupado(t.pid);setMensaje("Subiendo...");setError("");
    const fd=new FormData();fd.set("file",file);fd.set("productId",t.pid);fd.set("variantIds",t.vids.join(","));fd.set("target",t.target);
    const r=await fetch("/api/admin/assign",{method:"POST",body:fd});const j=await r.json();
    if(!r.ok){setError(j.error||"No se pudo subir la imagen");setMensaje("")}else{setRegistry(j.registry);setMensaje("Imagen guardada");if(t.target==="variants")limpiar(t.pid)}
    setOcupado("");targetRef.current=null;
  }
  async function eliminar(pid:string,vids:string[],target:"product"|"variants"){
    if(!confirm("¿Seguro deseas eliminar esta imagen?"))return;
    setOcupado(pid);setMensaje("Eliminando...");setError("");
    const r=await fetch("/api/admin/remove",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({target,productId:pid,variantIds:vids})});const j=await r.json();
    if(!r.ok){setError(j.error||"No se pudo eliminar");setMensaje("")}else{setRegistry(j.registry);setMensaje("Imagen eliminada");if(target==="variants")limpiar(pid)}setOcupado("");
  }

  if(!autorizado)return <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-5"><form onSubmit={login} className="w-full max-w-sm bg-white rounded-2xl shadow p-6"><h1 className="text-2xl font-bold mb-1">A Todo Trapo</h1><p className="text-slate-500 mb-5">Administrador de imágenes</p><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" className="w-full border rounded-xl px-4 py-3 mb-3"/><button className="w-full bg-blue-700 text-white rounded-xl py-3 font-semibold">Ingresar</button>{error&&<p className="text-red-600 text-sm mt-3">{error}</p>}</form></main>;

  return <main className="min-h-screen bg-slate-50 text-slate-900 p-3 md:p-8"><div className="max-w-6xl mx-auto">
    <input ref={inputGeneral} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>{subir(e.target.files?.[0]);e.currentTarget.value=""}}/>
    <input ref={inputVariantes} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>{subir(e.target.files?.[0]);e.currentTarget.value=""}}/>
    <div className="flex justify-between items-center gap-3 mb-5"><div><h1 className="text-2xl font-bold">Imágenes de productos</h1><p className="text-slate-500 text-sm">Una tarjeta por producto. Administrá imágenes generales y por variante.</p></div><button onClick={async()=>{await fetch('/api/admin/logout',{method:'POST'});location.reload()}} className="border rounded-xl px-4 py-2 bg-white">Salir</button></div>
    <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar por producto, marca, categoría o variante..." className="w-full bg-white border rounded-xl px-4 py-3 mb-3"/>
    {mensaje&&<div className="mb-3 bg-blue-50 text-blue-800 rounded-xl px-4 py-3">{mensaje}</div>}{error&&<div className="mb-3 bg-red-50 text-red-700 rounded-xl px-4 py-3">{error}</div>}
    <div className="space-y-3">{grupos.map(([pid,items])=>{const p=items[0],open=abierto===pid,sel=seleccionados(pid),general=registry.products[pid],preview=imagenEfectiva(p,registry);return <section key={pid} className="bg-white rounded-2xl border overflow-hidden">
      <button onClick={()=>setAbierto(open?null:pid)} className="w-full text-left p-4 flex items-center gap-3"><div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">{preview&&<img src={preview} alt="" className="w-full h-full object-contain"/>}</div><span className="min-w-0 flex-1"><b className="block truncate">{p.Nombre}</b><small className="block text-slate-500 truncate">{p.Marca}{p.Categoría&&` · ${p.Categoría}`}{p.Subcategoría&&` · ${p.Subcategoría}`}</small><small className="block mt-1 font-semibold text-blue-700">{items.length} variante{items.length===1?"":"s"}</small></span><span className="text-xl">{open?'−':'+'}</span></button>
      {open&&<div className="border-t p-4 space-y-5">
        <div className="rounded-2xl bg-slate-50 border p-3 flex flex-col sm:flex-row sm:items-center gap-3"><div className="w-24 h-24 bg-white rounded-xl overflow-hidden border shrink-0">{general?<img src={managedUrl(general)} alt="" className="w-full h-full object-contain"/>:<div className="h-full flex items-center justify-center text-xs text-slate-400 text-center p-2">Sin imagen general</div>}</div><div className="flex-1"><b>Imagen para todas las variantes</b><p className="text-sm text-slate-500 mt-1">Se usa automáticamente cuando una variante no tiene imagen específica.</p><div className="flex flex-wrap gap-2 mt-3"><button disabled={!!ocupado} onClick={()=>pedirArchivo(pid,[],"product")} className="bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold">{general?"Cambiar general":"Subir general"}</button>{general&&<button disabled={!!ocupado} onClick={()=>eliminar(pid,[],"product")} className="border border-red-200 text-red-600 px-4 py-2 rounded-xl">{ocupado===pid?"Eliminando...":"Eliminar general"}</button>}</div></div></div>
        {items.length>1&&<><div className="flex flex-wrap items-center gap-2"><button onClick={()=>seleccionarTodos(pid,items)} className="border px-3 py-2 rounded-xl text-sm">Seleccionar todas</button><button onClick={()=>limpiar(pid)} className="border px-3 py-2 rounded-xl text-sm">Deseleccionar</button><span className="text-sm font-semibold text-slate-600">{sel.size} seleccionada{sel.size===1?"":"s"}</span>{sel.size>0&&<><button disabled={!!ocupado} onClick={()=>pedirArchivo(pid,[...sel],"variants")} className="bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-semibold">Asignar imagen</button><button disabled={!!ocupado} onClick={()=>eliminar(pid,[...sel],"variants")} className="border border-red-200 text-red-600 px-3 py-2 rounded-xl text-sm">{ocupado===pid?"Eliminando...":"Eliminar específicas"}</button></>}</div>
        <div className="border rounded-2xl divide-y">{items.map(v=>{const vid=variantId(v),src=imagenEfectiva(v,registry),org=origen(v,registry);return <div key={vid} className="p-3 flex items-center gap-3"><input type="checkbox" checked={sel.has(vid)} onChange={()=>toggle(pid,vid)} className="w-5 h-5 shrink-0"/><div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">{src&&<img src={src} alt="" className="w-full h-full object-contain"/>}</div><div className="min-w-0 flex-1"><div className="font-semibold text-sm truncate">{etiqueta(v)}</div><span className={`inline-block mt-1 text-[11px] font-bold rounded-full px-2 py-0.5 ${org==='ESPECÍFICA'?'bg-violet-100 text-violet-700':org==='GENERAL'?'bg-blue-100 text-blue-700':org==='ANTIGUA'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-500'}`}>{org}</span></div><div className="flex items-center gap-2 shrink-0"><button disabled={!!ocupado} onClick={()=>pedirArchivo(pid,[vid],"variants")} className="border px-3 py-2 rounded-xl text-xs font-semibold">{registry.variants[vid]?"Cambiar":"Asignar"}</button>{registry.variants[vid]&&<button disabled={!!ocupado} onClick={()=>eliminar(pid,[vid],"variants")} className="border border-red-200 text-red-600 px-3 py-2 rounded-xl text-xs font-semibold">{ocupado===pid?"Eliminando...":"Eliminar"}</button>}</div></div>})}</div></>}
        {items.length===1&&<div className="text-sm text-slate-500">Este producto no necesita controles de variantes. Administrá su imagen desde “Imagen para todas las variantes”.</div>}
      </div>}
    </section>})}</div>
  </div></main>;
}
