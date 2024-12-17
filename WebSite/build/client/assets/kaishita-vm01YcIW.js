import{r as a,j as e}from"./jsx-runtime-56DGgGmo.js";import{u as b,a as y,F as j}from"./components-D6ZdaWVw.js";function m({name:r,image_href:i}){let[c,s]=a.useState(0);function p(t){s(l=>Math.max(0,l+t))}const u=()=>e.jsx("button",{type:"button",style:{...o.btn,...o.btnMore,...o.btnHover},onMouseOver:t=>t.currentTarget.style.backgroundColor="#388e3c",onMouseOut:t=>t.currentTarget.style.backgroundColor="#4caf50",onClick:t=>{t.preventDefault(),p(1)},children:"+"}),g=()=>e.jsx("button",{type:"button",style:{...o.btn,...o.btnLess,...o.btnHover},onMouseOver:t=>t.currentTarget.style.backgroundColor="#d32f2f",onMouseOut:t=>t.currentTarget.style.backgroundColor="#f44336",onClick:()=>{p(-1)},children:"-"});return e.jsxs("div",{className:"Product",style:o.productCard,children:[e.jsx("img",{src:i,alt:r,style:o.productImage}),e.jsx("h2",{style:o.productName,children:r}),e.jsxs("div",{style:o.productControls,children:[e.jsx(g,{}),e.jsx("input",{inputMode:"numeric",name:`quantity_${r}`,style:o.quantityInput,min:"0",placeholder:"0",value:c,onChange:t=>{const l=parseInt(t.target.value,10);s(isNaN(l)?0:Math.max(0,l))}}),e.jsx(u,{})]})]})}const o={productCard:{width:"300px",border:"1px solid #ddd",borderRadius:"8px",padding:"16px",backgroundColor:"#f9f9f9",boxShadow:"0 4px 6px rgba(0, 0, 0, 0.1)",textAlign:"center",margin:"0 auto",fontFamily:"Arial, sans-serif"},productImage:{width:"100%",height:"200px",objectFit:"cover",borderRadius:"4px"},productName:{fontSize:"1.25rem",fontWeight:"bold",color:"#333",margin:"16px 0"},productControls:{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"},quantityInput:{width:"60px",height:"36px",textAlign:"center",border:"1px solid #ddd",borderRadius:"4px",fontSize:"1rem"},btn:{padding:"8px 16px",fontSize:"1rem",fontWeight:"bold",border:"none",borderRadius:"4px",cursor:"pointer",color:"#fff"},btnLess:{backgroundColor:"#f44336"},btnMore:{backgroundColor:"#4caf50"},btnHover:{transition:"background-color 0.3s ease"}},C=()=>[{title:"Kaishita"},{name:"description",content:"Kaishita home page!"}];function S(){const r=b(),{clientId:i,emmiter:c,withdrawal:s}=y(),[p,u]=a.useState(void 0);let[g,t]=a.useState(""),[l,d]=a.useState("");return a.useEffect(()=>{t(s.message),s.status==="waiting"?d(`posição ${s.position}`):d(""),u(s.Buy)},[]),a.useEffect(()=>{if(!i){console.log("Loading clientId");return}const f=new EventSource(`/getStream?clientId=${i}`);if(!f){console.log("EventSource not available");return}return f.addEventListener(c,x=>{const n=JSON.parse(x.data);console.log(n),n.type==="withdrawal"?(u(n.Buy),n.status==="waiting"?d(`posição ${n.position}`):d(""),t(n.message)):n.type==="withdrawalResult"&&(n.status==="success"&&(u(void 0),d(""),t("")),alert(n.message))}),()=>{f.close()}},[i,s]),a.useEffect(()=>{r&&(r.success||alert(r.message))},[r]),e.jsxs("div",{style:h.container,children:[e.jsxs(j,{method:"post",children:[e.jsx("input",{type:"hidden",name:"clientId",value:i||""}),e.jsx(m,{name:"Kit-Kat",image_href:"kit-kat.png"}),e.jsx(m,{name:"Mentos",image_href:"mentos.png"}),e.jsx("button",{style:h.button,type:"submit",children:"Comprar"})]}),e.jsx("h1",{children:g}),e.jsx("h1",{children:l})]})}const h={container:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh"},logo:{width:"100px",height:"100px"},title:{fontSize:"2rem",fontWeight:"bold",margin:"1rem"},description:{fontSize:"1.5rem",margin:"1rem"},button:{padding:"0.5rem 1rem",fontSize:"1.25rem",backgroundColor:"#333",color:"#fff",border:"none",borderRadius:"4px",cursor:"pointer"}};export{S as default,C as meta};
