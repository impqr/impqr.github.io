import{F as Ee,v as Oe,l as te,M as v,G as Fe,x as He,E as d,e as E,y as re,S as Le,z as g,H as ze,I as y,R as O,J as F,K as se,L as We,u as m,b as f,i as U,w as ae,N as q,O as Ve,c as K,B as C,j as A,Q as S,k as T,V as w,W as Ne,a as je,C as P,X as ne,Y as ie,Z as oe,_ as le,$ as de,a0 as $e,P as qe,d as Ke,T as Y,D as ue,a1 as J,a2 as Ye,a3 as Je,a4 as Xe}from"./index-D38-VHo_.js";import{B as ce,c as Qe}from"./colorToUniform-KTpA7KSL.js";var Ze=`in vec2 vMaskCoord;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;

uniform float uAlpha;
uniform vec4 uMaskClamp;
uniform float uInverse;

out vec4 finalColor;

void main(void)
{
    float clip = step(3.5,
        step(uMaskClamp.x, vMaskCoord.x) +
        step(uMaskClamp.y, vMaskCoord.y) +
        step(vMaskCoord.x, uMaskClamp.z) +
        step(vMaskCoord.y, uMaskClamp.w));

    // TODO look into why this is needed
    float npmAlpha = uAlpha;
    vec4 original = texture(uTexture, vTextureCoord);
    vec4 masky = texture(uMaskTexture, vMaskCoord);
    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);

    float a = alphaMul * masky.r * npmAlpha * clip;

    if (uInverse == 1.0) {
        a = 1.0 - a;
    }

    finalColor = original * a;
}
`,et=`in vec2 aPosition;

out vec2 vTextureCoord;
out vec2 vMaskCoord;


uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
uniform mat3 uFilterMatrix;

vec4 filterVertexPosition(  vec2 aPosition )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
       
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(  vec2 aPosition )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

vec2 getFilterCoord( vec2 aPosition )
{
    return  ( uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}   

void main(void)
{
    gl_Position = filterVertexPosition(aPosition);
    vTextureCoord = filterTextureCoord(aPosition);
    vMaskCoord = getFilterCoord(aPosition);
}
`,X=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct MaskUniforms {
  uFilterMatrix:mat3x3<f32>,
  uMaskClamp:vec4<f32>,
  uAlpha:f32,
  uInverse:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> filterUniforms : MaskUniforms;
@group(1) @binding(1) var uMaskTexture: texture_2d<f32>;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) filterUv : vec2<f32>,
};

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);
}

fn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>
{
  return ( filterUniforms.uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}

fn getSize() -> vec2<f32>
{
  return gfu.uGlobalFrame.zw;
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
   getFilterCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) filterUv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var maskClamp = filterUniforms.uMaskClamp;
    var uAlpha = filterUniforms.uAlpha;

    var clip = step(3.5,
      step(maskClamp.x, filterUv.x) +
      step(maskClamp.y, filterUv.y) +
      step(filterUv.x, maskClamp.z) +
      step(filterUv.y, maskClamp.w));

    var mask = textureSample(uMaskTexture, uSampler, filterUv);
    var source = textureSample(uTexture, uSampler, uv);
    var alphaMul = 1.0 - uAlpha * (1.0 - mask.a);

    var a: f32 = alphaMul * mask.r * uAlpha * clip;

    if (filterUniforms.uInverse == 1.0) {
        a = 1.0 - a;
    }

    return source * a;
}
`;class tt extends Ee{constructor(e){const{sprite:t,...r}=e,s=new Oe(t.texture),n=new te({uFilterMatrix:{value:new v,type:"mat3x3<f32>"},uMaskClamp:{value:s.uClampFrame,type:"vec4<f32>"},uAlpha:{value:1,type:"f32"},uInverse:{value:e.inverse?1:0,type:"f32"}}),i=Fe.from({vertex:{source:X,entryPoint:"mainVertex"},fragment:{source:X,entryPoint:"mainFragment"}}),o=He.from({vertex:et,fragment:Ze,name:"mask-filter"});super({...r,gpuProgram:i,glProgram:o,resources:{filterUniforms:n,uMaskTexture:t.texture.source}}),this.sprite=t,this._textureMatrix=s}set inverse(e){this.resources.filterUniforms.uniforms.uInverse=e?1:0}get inverse(){return this.resources.filterUniforms.uniforms.uInverse===1}apply(e,t,r,s){this._textureMatrix.texture=this.sprite.texture,e.calculateSpriteMatrix(this.resources.filterUniforms.uniforms.uFilterMatrix,this.sprite).prepend(this._textureMatrix.mapCoord),this.resources.uMaskTexture=this.sprite.texture.source,e.applyFilter(this,t,r,s)}}const H=class he{constructor(e,t){var r,s;this.state=Le.for2d(),this._batchersByInstructionSet=Object.create(null),this._activeBatches=Object.create(null),this.renderer=e,this._adaptor=t,(s=(r=this._adaptor).init)==null||s.call(r,this)}static getBatcher(e){return new this._availableBatchers[e]}buildStart(e){let t=this._batchersByInstructionSet[e.uid];t||(t=this._batchersByInstructionSet[e.uid]=Object.create(null),t.default||(t.default=new re)),this._activeBatches=t,this._activeBatch=this._activeBatches.default;for(const r in this._activeBatches)this._activeBatches[r].begin()}addToBatch(e,t){if(this._activeBatch.name!==e.batcherName){this._activeBatch.break(t);let r=this._activeBatches[e.batcherName];r||(r=this._activeBatches[e.batcherName]=he.getBatcher(e.batcherName),r.begin()),this._activeBatch=r}this._activeBatch.add(e)}break(e){this._activeBatch.break(e)}buildEnd(e){this._activeBatch.break(e);const t=this._activeBatches;for(const r in t){const s=t[r],n=s.geometry;n.indexBuffer.setDataWithSize(s.indexBuffer,s.indexSize,!0),n.buffers[0].setDataWithSize(s.attributeBuffer.float32View,s.attributeSize,!1)}}upload(e){const t=this._batchersByInstructionSet[e.uid];for(const r in t){const s=t[r],n=s.geometry;s.dirty&&(s.dirty=!1,n.buffers[0].update(s.attributeSize*4))}}execute(e){if(e.action==="startBatch"){const t=e.batcher,r=t.geometry,s=t.shader;this._adaptor.start(this,r,s)}this._adaptor.execute(this,e)}destroy(){this.state=null,this.renderer=null,this._adaptor=null;for(const e in this._activeBatches)this._activeBatches[e].destroy();this._activeBatches=null}};H.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"batch"};H._availableBatchers=Object.create(null);let fe=H;E.handleByMap(d.Batcher,fe._availableBatchers);E.add(re);const Ut={name:"texture-bit",vertex:{header:`

        struct TextureUniforms {
            uTextureMatrix:mat3x3<f32>,
        }

        @group(2) @binding(2) var<uniform> textureUniforms : TextureUniforms;
        `,main:`
            uv = (textureUniforms.uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
            @group(2) @binding(0) var uTexture: texture_2d<f32>;
            @group(2) @binding(1) var uSampler: sampler;

         
        `,main:`
            outColor = textureSample(uTexture, uSampler, vUV);
        `}},At={name:"texture-bit",vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;

         
        `,main:`
            outColor = texture(uTexture, vUV);
        `}};function rt(a,e){const t=a.root,r=a.instructionSet;r.reset();const s=e.renderPipes?e:e.batch.renderer,n=s.renderPipes;n.batch.buildStart(r),n.blendMode.buildStart(),n.colorMask.buildStart(),t.sortableChildren&&t.sortChildren(),pe(t,r,s,!0),n.batch.buildEnd(r),n.blendMode.buildEnd(r)}function R(a,e,t){const r=t.renderPipes?t:t.batch.renderer;a.globalDisplayStatus<7||!a.includeInBuild||(a.sortableChildren&&a.sortChildren(),a.isSimple?st(a,e,r):pe(a,e,r,!1))}function st(a,e,t){if(a.renderPipeId){const r=a,{renderPipes:s,renderableGC:n}=t;s.blendMode.setBlendMode(r,a.groupBlendMode,e),s[r.renderPipeId].addRenderable(r,e),n.addRenderable(r),r.didViewUpdate=!1}if(!a.renderGroup){const r=a.children,s=r.length;for(let n=0;n<s;n++)R(r[n],e,t)}}function pe(a,e,t,r){const{renderPipes:s,renderableGC:n}=t;if(!r&&a.renderGroup)s.renderGroup.addRenderGroup(a.renderGroup,e);else{for(let u=0;u<a.effects.length;u++){const c=a.effects[u];s[c.pipe].push(c,a,e)}const i=a,o=i.renderPipeId;o&&(s.blendMode.setBlendMode(i,i.groupBlendMode,e),s[o].addRenderable(i,e),n.addRenderable(i),i.didViewUpdate=!1);const l=a.children;if(l.length)for(let u=0;u<l.length;u++)R(l[u],e,t);for(let u=a.effects.length-1;u>=0;u--){const c=a.effects[u];s[c.pipe].pop(c,a,e)}}}const at=new F;class nt extends se{constructor(){super(),this.filters=[new tt({sprite:new We(m.EMPTY),inverse:!1,resolution:"inherit",antialias:"inherit"})]}get sprite(){return this.filters[0].sprite}set sprite(e){this.filters[0].sprite=e}get inverse(){return this.filters[0].inverse}set inverse(e){this.filters[0].inverse=e}}class me{constructor(e){this._activeMaskStage=[],this._renderer=e}push(e,t,r){const s=this._renderer;if(s.renderPipes.batch.break(r),r.add({renderPipeId:"alphaMask",action:"pushMaskBegin",mask:e,inverse:t._maskOptions.inverse,canBundle:!1,maskedContainer:t}),e.inverse=t._maskOptions.inverse,e.renderMaskToTexture){const n=e.mask;n.includeInBuild=!0,R(n,r,s),n.includeInBuild=!1}s.renderPipes.batch.break(r),r.add({renderPipeId:"alphaMask",action:"pushMaskEnd",mask:e,maskedContainer:t,inverse:t._maskOptions.inverse,canBundle:!1})}pop(e,t,r){this._renderer.renderPipes.batch.break(r),r.add({renderPipeId:"alphaMask",action:"popMaskEnd",mask:e,inverse:t._maskOptions.inverse,canBundle:!1})}execute(e){const t=this._renderer,r=e.mask.renderMaskToTexture;if(e.action==="pushMaskBegin"){const s=g.get(nt);if(s.inverse=e.inverse,r){e.mask.mask.measurable=!0;const n=ze(e.mask.mask,!0,at);e.mask.mask.measurable=!1,n.ceil();const i=t.renderTarget.renderTarget.colorTexture.source,o=y.getOptimalTexture(n.width,n.height,i._resolution,i.antialias);t.renderTarget.push(o,!0),t.globalUniforms.push({offset:n,worldColor:4294967295});const l=s.sprite;l.texture=o,l.worldTransform.tx=n.minX,l.worldTransform.ty=n.minY,this._activeMaskStage.push({filterEffect:s,maskedContainer:e.maskedContainer,filterTexture:o})}else s.sprite=e.mask.mask,this._activeMaskStage.push({filterEffect:s,maskedContainer:e.maskedContainer})}else if(e.action==="pushMaskEnd"){const s=this._activeMaskStage[this._activeMaskStage.length-1];r&&(t.type===O.WEBGL&&t.renderTarget.finishRenderPass(),t.renderTarget.pop(),t.globalUniforms.pop()),t.filter.push({renderPipeId:"filter",action:"pushFilter",container:s.maskedContainer,filterEffect:s.filterEffect,canBundle:!1})}else if(e.action==="popMaskEnd"){t.filter.pop();const s=this._activeMaskStage.pop();r&&y.returnTexture(s.filterTexture),g.return(s.filterEffect)}}destroy(){this._renderer=null,this._activeMaskStage=null}}me.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"alphaMask"};class ve{constructor(e){this._colorStack=[],this._colorStackIndex=0,this._currentColor=0,this._renderer=e}buildStart(){this._colorStack[0]=15,this._colorStackIndex=1,this._currentColor=15}push(e,t,r){this._renderer.renderPipes.batch.break(r);const n=this._colorStack;n[this._colorStackIndex]=n[this._colorStackIndex-1]&e.mask;const i=this._colorStack[this._colorStackIndex];i!==this._currentColor&&(this._currentColor=i,r.add({renderPipeId:"colorMask",colorMask:i,canBundle:!1})),this._colorStackIndex++}pop(e,t,r){this._renderer.renderPipes.batch.break(r);const n=this._colorStack;this._colorStackIndex--;const i=n[this._colorStackIndex-1];i!==this._currentColor&&(this._currentColor=i,r.add({renderPipeId:"colorMask",colorMask:i,canBundle:!1}))}execute(e){this._renderer.colorMask.setMask(e.colorMask)}destroy(){this._colorStack=null}}ve.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"colorMask"};class ge{constructor(e){this._maskStackHash={},this._maskHash=new WeakMap,this._renderer=e}push(e,t,r){var s;const n=e,i=this._renderer;i.renderPipes.batch.break(r),i.renderPipes.blendMode.setBlendMode(n.mask,"none",r),r.add({renderPipeId:"stencilMask",action:"pushMaskBegin",mask:e,inverse:t._maskOptions.inverse,canBundle:!1});const o=n.mask;o.includeInBuild=!0,this._maskHash.has(n)||this._maskHash.set(n,{instructionsStart:0,instructionsLength:0});const l=this._maskHash.get(n);l.instructionsStart=r.instructionSize,R(o,r,i),o.includeInBuild=!1,i.renderPipes.batch.break(r),r.add({renderPipeId:"stencilMask",action:"pushMaskEnd",mask:e,inverse:t._maskOptions.inverse,canBundle:!1});const u=r.instructionSize-l.instructionsStart-1;l.instructionsLength=u;const c=i.renderTarget.renderTarget.uid;(s=this._maskStackHash)[c]??(s[c]=0)}pop(e,t,r){const s=e,n=this._renderer;n.renderPipes.batch.break(r),n.renderPipes.blendMode.setBlendMode(s.mask,"none",r),r.add({renderPipeId:"stencilMask",action:"popMaskBegin",inverse:t._maskOptions.inverse,canBundle:!1});const i=this._maskHash.get(e);for(let o=0;o<i.instructionsLength;o++)r.instructions[r.instructionSize++]=r.instructions[i.instructionsStart++];r.add({renderPipeId:"stencilMask",action:"popMaskEnd",canBundle:!1})}execute(e){var t;const r=this._renderer,s=r.renderTarget.renderTarget.uid;let n=(t=this._maskStackHash)[s]??(t[s]=0);e.action==="pushMaskBegin"?(r.renderTarget.ensureDepthStencil(),r.stencil.setStencilMode(f.RENDERING_MASK_ADD,n),n++,r.colorMask.setMask(0)):e.action==="pushMaskEnd"?(e.inverse?r.stencil.setStencilMode(f.INVERSE_MASK_ACTIVE,n):r.stencil.setStencilMode(f.MASK_ACTIVE,n),r.colorMask.setMask(15)):e.action==="popMaskBegin"?(r.colorMask.setMask(0),n!==0?r.stencil.setStencilMode(f.RENDERING_MASK_REMOVE,n):(r.renderTarget.clear(null,U.STENCIL),r.stencil.setStencilMode(f.DISABLED,n)),n--):e.action==="popMaskEnd"&&(e.inverse?r.stencil.setStencilMode(f.INVERSE_MASK_ACTIVE,n):r.stencil.setStencilMode(f.MASK_ACTIVE,n),r.colorMask.setMask(15)),this._maskStackHash[s]=n}destroy(){this._renderer=null,this._maskStackHash=null,this._maskHash=null}}ge.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"stencilMask"};function It(a,e){for(const t in a.attributes){const r=a.attributes[t],s=e[t];s?(r.format??(r.format=s.format),r.offset??(r.offset=s.offset),r.instance??(r.instance=s.instance)):ae(`Attribute ${t} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`)}it(a)}function it(a){const{buffers:e,attributes:t}=a,r={},s={};for(const n in e){const i=e[n];r[i.uid]=0,s[i.uid]=0}for(const n in t){const i=t[n];r[i.buffer.uid]+=q(i.format).stride}for(const n in t){const i=t[n];i.stride??(i.stride=r[i.buffer.uid]),i.start??(i.start=s[i.buffer.uid]),s[i.buffer.uid]+=q(i.format).stride}}const _=[];_[f.NONE]=void 0;_[f.DISABLED]={stencilWriteMask:0,stencilReadMask:0};_[f.RENDERING_MASK_ADD]={stencilFront:{compare:"equal",passOp:"increment-clamp"},stencilBack:{compare:"equal",passOp:"increment-clamp"}};_[f.RENDERING_MASK_REMOVE]={stencilFront:{compare:"equal",passOp:"decrement-clamp"},stencilBack:{compare:"equal",passOp:"decrement-clamp"}};_[f.MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"equal",passOp:"keep"},stencilBack:{compare:"equal",passOp:"keep"}};_[f.INVERSE_MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"not-equal",passOp:"replace"},stencilBack:{compare:"not-equal",passOp:"replace"}};class Gt{constructor(e){this._syncFunctionHash=Object.create(null),this._adaptor=e,this._systemCheck()}_systemCheck(){if(!Ve())throw new Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}ensureUniformGroup(e){const t=this.getUniformGroupData(e);e.buffer||(e.buffer=new K({data:new Float32Array(t.layout.size/4),usage:C.UNIFORM|C.COPY_DST}))}getUniformGroupData(e){return this._syncFunctionHash[e._signature]||this._initUniformGroup(e)}_initUniformGroup(e){const t=e._signature;let r=this._syncFunctionHash[t];if(!r){const s=Object.keys(e.uniformStructures).map(o=>e.uniformStructures[o]),n=this._adaptor.createUboElements(s),i=this._generateUboSync(n.uboElements);r=this._syncFunctionHash[t]={layout:n,syncFunction:i}}return this._syncFunctionHash[t]}_generateUboSync(e){return this._adaptor.generateUboSync(e)}syncUniformGroup(e,t,r){const s=this.getUniformGroupData(e);e.buffer||(e.buffer=new K({data:new Float32Array(s.layout.size/4),usage:C.UNIFORM|C.COPY_DST}));let n=null;return t||(t=e.buffer.data,n=e.buffer.dataInt32),r||(r=0),s.syncFunction(e.uniforms,t,n,r),!0}updateUniformGroup(e){if(e.isStatic&&!e._dirtyId)return!1;e._dirtyId=0;const t=this.syncUniformGroup(e);return e.buffer.update(),t}destroy(){this._syncFunctionHash=null}}const M=[{type:"mat3x3<f32>",test:a=>a.value.a!==void 0,ubo:`
            var matrix = uv[name].toArray(true);
            data[offset] = matrix[0];
            data[offset + 1] = matrix[1];
            data[offset + 2] = matrix[2];
            data[offset + 4] = matrix[3];
            data[offset + 5] = matrix[4];
            data[offset + 6] = matrix[5];
            data[offset + 8] = matrix[6];
            data[offset + 9] = matrix[7];
            data[offset + 10] = matrix[8];
        `,uniform:`
            gl.uniformMatrix3fv(ud[name].location, false, uv[name].toArray(true));
        `},{type:"vec4<f32>",test:a=>a.type==="vec4<f32>"&&a.size===1&&a.value.width!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
            data[offset + 2] = v.width;
            data[offset + 3] = v.height;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height) {
                cv[0] = v.x;
                cv[1] = v.y;
                cv[2] = v.width;
                cv[3] = v.height;
                gl.uniform4f(ud[name].location, v.x, v.y, v.width, v.height);
            }
        `},{type:"vec2<f32>",test:a=>a.type==="vec2<f32>"&&a.size===1&&a.value.x!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y) {
                cv[0] = v.x;
                cv[1] = v.y;
                gl.uniform2f(ud[name].location, v.x, v.y);
            }
        `},{type:"vec4<f32>",test:a=>a.type==="vec4<f32>"&&a.size===1&&a.value.red!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
            data[offset + 3] = v.alpha;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                cv[3] = v.alpha;
                gl.uniform4f(ud[name].location, v.red, v.green, v.blue, v.alpha);
            }
        `},{type:"vec3<f32>",test:a=>a.type==="vec3<f32>"&&a.size===1&&a.value.red!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                gl.uniform3f(ud[name].location, v.red, v.green, v.blue);
            }
        `}];function Dt(a,e,t,r){const s=[`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `];let n=0;for(let o=0;o<a.length;o++){const l=a[o],u=l.data.name;let c=!1,h=0;for(let p=0;p<M.length;p++)if(M[p].test(l.data)){h=l.offset/4,s.push(`name = "${u}";`,`offset += ${h-n};`,M[p][e]||M[p].ubo),c=!0;break}if(!c)if(l.data.size>1)h=l.offset/4,s.push(t(l,h-n));else{const p=r[l.data.type];h=l.offset/4,s.push(`
                    v = uv.${u};
                    offset += ${h-n};
                    ${p};
                `)}n=h}const i=s.join(`
`);return new Function("uv","data","dataInt32","offset",i)}function x(a,e){return`
        for (let i = 0; i < ${a*e}; i++) {
            data[offset + (((i / ${a})|0) * 4) + (i % ${a})] = v[i];
        }
    `}const ot={f32:`
        data[offset] = v;`,i32:`
        dataInt32[offset] = v;`,"vec2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];`,"vec3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,"vec4<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,"vec2<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];`,"vec3<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];`,"vec4<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];
        dataInt32[offset + 3] = v[3];`,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,"mat3x3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,"mat4x4<f32>":`
        for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,"mat3x2<f32>":x(3,2),"mat4x2<f32>":x(4,2),"mat2x3<f32>":x(2,3),"mat4x3<f32>":x(4,3),"mat2x4<f32>":x(2,4),"mat3x4<f32>":x(3,4)},Et={...ot,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `};function lt(a,e,t,r,s,n){const i=n?1:-1;return a.identity(),a.a=1/r*2,a.d=i*(1/s*2),a.tx=-1-e*a.a,a.ty=-i-t*a.d,a}const b=new Map;function xe(a,e){if(!b.has(a)){const t=new m({source:new A({resource:a,...e})}),r=()=>{b.get(a)===t&&b.delete(a)};t.once("destroy",r),t.source.once("destroy",r),b.set(a,t)}return b.get(a)}function dt(a){const e=a.colorTexture.source.resource;return globalThis.HTMLCanvasElement&&e instanceof HTMLCanvasElement&&document.body.contains(e)}const _e=class be{constructor(e={}){if(this.uid=S("renderTarget"),this.colorTextures=[],this.dirtyId=0,this.isRoot=!1,this._size=new Float32Array(2),this._managedColorTextures=!1,e={...be.defaultOptions,...e},this.stencil=e.stencil,this.depth=e.depth,this.isRoot=e.isRoot,typeof e.colorTextures=="number"){this._managedColorTextures=!0;for(let t=0;t<e.colorTextures;t++)this.colorTextures.push(new T({width:e.width,height:e.height,resolution:e.resolution,antialias:e.antialias}))}else{this.colorTextures=[...e.colorTextures.map(r=>r.source)];const t=this.colorTexture.source;this.resize(t.width,t.height,t._resolution)}this.colorTexture.source.on("resize",this.onSourceResize,this),(e.depthStencilTexture||this.stencil)&&(e.depthStencilTexture instanceof m||e.depthStencilTexture instanceof T?this.depthStencilTexture=e.depthStencilTexture.source:this.ensureDepthStencilTexture())}get size(){const e=this._size;return e[0]=this.pixelWidth,e[1]=this.pixelHeight,e}get width(){return this.colorTexture.source.width}get height(){return this.colorTexture.source.height}get pixelWidth(){return this.colorTexture.source.pixelWidth}get pixelHeight(){return this.colorTexture.source.pixelHeight}get resolution(){return this.colorTexture.source._resolution}get colorTexture(){return this.colorTextures[0]}onSourceResize(e){this.resize(e.width,e.height,e._resolution,!0)}ensureDepthStencilTexture(){this.depthStencilTexture||(this.depthStencilTexture=new T({width:this.width,height:this.height,resolution:this.resolution,format:"depth24plus-stencil8",autoGenerateMipmaps:!1,antialias:!1,mipLevelCount:1}))}resize(e,t,r=this.resolution,s=!1){this.dirtyId++,this.colorTextures.forEach((n,i)=>{s&&i===0||n.source.resize(e,t,r)}),this.depthStencilTexture&&this.depthStencilTexture.source.resize(e,t,r)}destroy(){this.colorTexture.source.off("resize",this.onSourceResize,this),this._managedColorTextures&&this.colorTextures.forEach(e=>{e.destroy()}),this.depthStencilTexture&&(this.depthStencilTexture.destroy(),delete this.depthStencilTexture)}};_e.defaultOptions={width:0,height:0,resolution:1,colorTextures:1,stencil:!1,depth:!1,antialias:!1,isRoot:!1};let I=_e;class Ot{constructor(e){this.rootViewPort=new w,this.viewport=new w,this.onRenderTargetChange=new Ne("onRenderTargetChange"),this.projectionMatrix=new v,this.defaultClearColor=[0,0,0,0],this._renderSurfaceToRenderTargetHash=new Map,this._gpuRenderTargetHash=Object.create(null),this._renderTargetStack=[],this._renderer=e,e.renderableGC.addManagedHash(this,"_gpuRenderTargetHash")}finishRenderPass(){this.adaptor.finishRenderPass(this.renderTarget)}renderStart({target:e,clear:t,clearColor:r,frame:s}){var n,i;this._renderTargetStack.length=0,this.push(e,t,r,s),this.rootViewPort.copyFrom(this.viewport),this.rootRenderTarget=this.renderTarget,this.renderingToScreen=dt(this.rootRenderTarget),(i=(n=this.adaptor).prerender)==null||i.call(n,this.rootRenderTarget)}postrender(){var e,t;(t=(e=this.adaptor).postrender)==null||t.call(e,this.rootRenderTarget)}bind(e,t=!0,r,s){const n=this.getRenderTarget(e),i=this.renderTarget!==n;this.renderTarget=n,this.renderSurface=e;const o=this.getGpuRenderTarget(n);(n.pixelWidth!==o.width||n.pixelHeight!==o.height)&&(this.adaptor.resizeGpuRenderTarget(n),o.width=n.pixelWidth,o.height=n.pixelHeight);const l=n.colorTexture,u=this.viewport,c=l.pixelWidth,h=l.pixelHeight;if(!s&&e instanceof m&&(s=e.frame),s){const p=l._resolution;u.x=s.x*p+.5|0,u.y=s.y*p+.5|0,u.width=s.width*p+.5|0,u.height=s.height*p+.5|0}else u.x=0,u.y=0,u.width=c,u.height=h;return lt(this.projectionMatrix,0,0,u.width/l.resolution,u.height/l.resolution,!n.isRoot),this.adaptor.startRenderPass(n,t,r,u),i&&this.onRenderTargetChange.emit(n),n}clear(e,t=U.ALL,r){t&&(e&&(e=this.getRenderTarget(e)),this.adaptor.clear(e||this.renderTarget,t,r,this.viewport))}contextChange(){this._gpuRenderTargetHash=Object.create(null)}push(e,t=U.ALL,r,s){const n=this.bind(e,t,r,s);return this._renderTargetStack.push({renderTarget:n,frame:s}),n}pop(){this._renderTargetStack.pop();const e=this._renderTargetStack[this._renderTargetStack.length-1];this.bind(e.renderTarget,!1,null,e.frame)}getRenderTarget(e){return e.isTexture&&(e=e.source),this._renderSurfaceToRenderTargetHash.get(e)??this._initRenderTarget(e)}copyToTexture(e,t,r,s,n){r.x<0&&(s.width+=r.x,n.x-=r.x,r.x=0),r.y<0&&(s.height+=r.y,n.y-=r.y,r.y=0);const{pixelWidth:i,pixelHeight:o}=e;return s.width=Math.min(s.width,i-r.x),s.height=Math.min(s.height,o-r.y),this.adaptor.copyToTexture(e,t,r,s,n)}ensureDepthStencil(){this.renderTarget.stencil||(this.renderTarget.stencil=!0,this.adaptor.startRenderPass(this.renderTarget,!1,null,this.viewport))}destroy(){this._renderer=null,this._renderSurfaceToRenderTargetHash.forEach((e,t)=>{e!==t&&e.destroy()}),this._renderSurfaceToRenderTargetHash.clear(),this._gpuRenderTargetHash=Object.create(null)}_initRenderTarget(e){let t=null;return A.test(e)&&(e=xe(e).source),e instanceof I?t=e:e instanceof T&&(t=new I({colorTextures:[e]}),A.test(e.source.resource)&&(t.isRoot=!0),e.once("destroy",()=>{t.destroy(),this._renderSurfaceToRenderTargetHash.delete(e);const r=this._gpuRenderTargetHash[t.uid];r&&(this._gpuRenderTargetHash[t.uid]=null,this.adaptor.destroyGpuRenderTarget(r))})),this._renderSurfaceToRenderTargetHash.set(e,t),t}getGpuRenderTarget(e){return this._gpuRenderTargetHash[e.uid]||(this._gpuRenderTargetHash[e.uid]=this.adaptor.initGpuRenderTarget(e))}}class Ft extends je{constructor({buffer:e,offset:t,size:r}){super(),this.uid=S("buffer"),this._resourceType="bufferResource",this._touched=0,this._resourceId=S("resource"),this._bufferResource=!0,this.destroyed=!1,this.buffer=e,this.offset=t|0,this.size=r,this.buffer.on("change",this.onBufferChange,this)}onBufferChange(){this._resourceId=S("resource"),this.emit("change",this)}destroy(e=!1){this.destroyed=!0,e&&this.buffer.destroy(),this.emit("change",this),this.buffer=null}}class ye{constructor(e){this._renderer=e}updateRenderable(){}destroyRenderable(){}validateRenderable(){return!1}addRenderable(e,t){this._renderer.renderPipes.batch.break(t),t.add(e)}execute(e){e.isRenderable&&e.render(this._renderer)}destroy(){this._renderer=null}}ye.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"customRender"};function G(a,e){const t=a.instructionSet,r=t.instructions;for(let s=0;s<t.instructionSize;s++){const n=r[s];e[n.renderPipeId].execute(n)}}const ut=new v;class Te{constructor(e){this._renderer=e}addRenderGroup(e,t){e.isCachedAsTexture?this._addRenderableCacheAsTexture(e,t):this._addRenderableDirect(e,t)}execute(e){e.isRenderable&&(e.isCachedAsTexture?this._executeCacheAsTexture(e):this._executeDirect(e))}destroy(){this._renderer=null}_addRenderableDirect(e,t){this._renderer.renderPipes.batch.break(t),e._batchableRenderGroup&&(g.return(e._batchableRenderGroup),e._batchableRenderGroup=null),t.add(e)}_addRenderableCacheAsTexture(e,t){const r=e._batchableRenderGroup??(e._batchableRenderGroup=g.get(ce));r.renderable=e.root,r.transform=e.root.relativeGroupTransform,r.texture=e.texture,r.bounds=e._textureBounds,t.add(e),this._renderer.renderPipes.batch.addToBatch(r,t)}_executeCacheAsTexture(e){if(e.textureNeedsUpdate){e.textureNeedsUpdate=!1;const t=ut.identity().translate(-e._textureBounds.x,-e._textureBounds.y);this._renderer.renderTarget.push(e.texture,!0,null,e.texture.frame),this._renderer.globalUniforms.push({worldTransformMatrix:t,worldColor:4294967295}),G(e,this._renderer.renderPipes),this._renderer.renderTarget.finishRenderPass(),this._renderer.renderTarget.pop(),this._renderer.globalUniforms.pop()}e._batchableRenderGroup._batcher.updateElement(e._batchableRenderGroup),e._batchableRenderGroup._batcher.geometry.buffers[0].update()}_executeDirect(e){this._renderer.globalUniforms.push({worldTransformMatrix:e.inverseParentTextureTransform,worldColor:e.worldColorAlpha}),G(e,this._renderer.renderPipes),this._renderer.globalUniforms.pop()}}Te.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"renderGroup"};function D(a,e){e||(e=0);for(let t=e;t<a.length&&a[t];t++)a[t]=null}const ct=new P,Q=le|ie|oe;function ke(a,e=!1){ht(a);const t=a.childrenToUpdate,r=a.updateTick++;for(const s in t){const n=Number(s),i=t[s],o=i.list,l=i.index;for(let u=0;u<l;u++){const c=o[u];c.parentRenderGroup===a&&c.relativeRenderGroupDepth===n&&Ce(c,r,0)}D(o,l),i.index=0}if(e)for(let s=0;s<a.renderGroupChildren.length;s++)ke(a.renderGroupChildren[s],e)}function ht(a){const e=a.root;let t;if(a.renderGroupParent){const r=a.renderGroupParent;a.worldTransform.appendFrom(e.relativeGroupTransform,r.worldTransform),a.worldColor=ne(e.groupColor,r.worldColor),t=e.groupAlpha*r.worldAlpha}else a.worldTransform.copyFrom(e.localTransform),a.worldColor=e.localColor,t=e.localAlpha;t=t<0?0:t>1?1:t,a.worldAlpha=t,a.worldColorAlpha=a.worldColor+((t*255|0)<<24)}function Ce(a,e,t){if(e===a.updateTick)return;a.updateTick=e,a.didChange=!1;const r=a.localTransform;a.updateLocalTransform();const s=a.parent;if(s&&!s.renderGroup?(t|=a._updateFlags,a.relativeGroupTransform.appendFrom(r,s.relativeGroupTransform),t&Q&&Z(a,s,t)):(t=a._updateFlags,a.relativeGroupTransform.copyFrom(r),t&Q&&Z(a,ct,t)),!a.renderGroup){const n=a.children,i=n.length;for(let u=0;u<i;u++)Ce(n[u],e,t);const o=a.parentRenderGroup,l=a;l.renderPipeId&&!o.structureDidChange&&o.updateRenderable(l)}}function Z(a,e,t){if(t&ie){a.groupColor=ne(a.localColor,e.groupColor);let r=a.localAlpha*e.groupAlpha;r=r<0?0:r>1?1:r,a.groupAlpha=r,a.groupColorAlpha=a.groupColor+((r*255|0)<<24)}t&oe&&(a.groupBlendMode=a.localBlendMode==="inherit"?e.groupBlendMode:a.localBlendMode),t&le&&(a.globalDisplayStatus=a.localDisplayStatus&e.globalDisplayStatus),a._updateFlags=0}function ft(a,e){const{list:t,index:r}=a.childrenRenderablesToUpdate;let s=!1;for(let n=0;n<r;n++){const i=t[n];if(s=e[i.renderPipeId].validateRenderable(i),s)break}return a.structureDidChange=s,s}const pt=new v;class Me{constructor(e){this._renderer=e}render({container:e,transform:t}){const r=e.parent,s=e.renderGroup.renderGroupParent;e.parent=null,e.renderGroup.renderGroupParent=null;const n=this._renderer;let i=pt;t&&(i=i.copyFrom(e.renderGroup.localTransform),e.renderGroup.localTransform.copyFrom(t));const o=n.renderPipes;this._updateCachedRenderGroups(e.renderGroup,null),this._updateRenderGroups(e.renderGroup),n.globalUniforms.start({worldTransformMatrix:t?e.renderGroup.localTransform:e.renderGroup.worldTransform,worldColor:e.renderGroup.worldColorAlpha}),G(e.renderGroup,o),o.uniformBatch&&o.uniformBatch.renderEnd(),t&&e.renderGroup.localTransform.copyFrom(i),e.parent=r,e.renderGroup.renderGroupParent=s}destroy(){this._renderer=null}_updateCachedRenderGroups(e,t){if(e.isCachedAsTexture){if(!e.updateCacheTexture)return;t=e}e._parentCacheAsTextureRenderGroup=t;for(let r=e.renderGroupChildren.length-1;r>=0;r--)this._updateCachedRenderGroups(e.renderGroupChildren[r],t);if(e.invalidateMatrices(),e.isCachedAsTexture){if(e.textureNeedsUpdate){const r=e.root.getLocalBounds();r.ceil();const s=e.texture;e.texture&&y.returnTexture(e.texture);const n=this._renderer,i=e.textureOptions.resolution||n.view.resolution,o=e.textureOptions.antialias??n.view.antialias;e.texture=y.getOptimalTexture(r.width,r.height,i,o),e._textureBounds||(e._textureBounds=new F),e._textureBounds.copyFrom(r),s!==e.texture&&e.renderGroupParent&&(e.renderGroupParent.structureDidChange=!0)}}else e.texture&&(y.returnTexture(e.texture),e.texture=null)}_updateRenderGroups(e){const t=this._renderer,r=t.renderPipes;if(e.runOnRender(),e.instructionSet.renderPipes=r,e.structureDidChange?D(e.childrenRenderablesToUpdate.list,0):ft(e,r),ke(e),e.structureDidChange?(e.structureDidChange=!1,rt(e,t)):this._updateRenderables(e),e.childrenRenderablesToUpdate.index=0,t.renderPipes.batch.upload(e.instructionSet),!(e.isCachedAsTexture&&!e.textureNeedsUpdate))for(let s=0;s<e.renderGroupChildren.length;s++)this._updateRenderGroups(e.renderGroupChildren[s])}_updateRenderables(e){const{list:t,index:r}=e.childrenRenderablesToUpdate;for(let s=0;s<r;s++){const n=t[s];n.didViewUpdate&&e.updateRenderable(n)}D(t,r)}}Me.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"renderGroup"};class Se{constructor(e){this._gpuSpriteHash=Object.create(null),this._destroyRenderableBound=this.destroyRenderable.bind(this),this._renderer=e,this._renderer.renderableGC.addManagedHash(this,"_gpuSpriteHash")}addRenderable(e,t){const r=this._getGpuSprite(e);e.didViewUpdate&&this._updateBatchableSprite(e,r),this._renderer.renderPipes.batch.addToBatch(r,t)}updateRenderable(e){const t=this._gpuSpriteHash[e.uid];e.didViewUpdate&&this._updateBatchableSprite(e,t),t._batcher.updateElement(t)}validateRenderable(e){const t=this._getGpuSprite(e);return!t._batcher.checkAndUpdateTexture(t,e._texture)}destroyRenderable(e){const t=this._gpuSpriteHash[e.uid];g.return(t),this._gpuSpriteHash[e.uid]=null,e.off("destroyed",this._destroyRenderableBound)}_updateBatchableSprite(e,t){t.bounds=e.visualBounds,t.texture=e._texture}_getGpuSprite(e){return this._gpuSpriteHash[e.uid]||this._initGPUSprite(e)}_initGPUSprite(e){const t=g.get(ce);return t.renderable=e,t.transform=e.groupTransform,t.texture=e._texture,t.bounds=e.visualBounds,t.roundPixels=this._renderer._roundPixels|e._roundPixels,this._gpuSpriteHash[e.uid]=t,e.on("destroyed",this._destroyRenderableBound),t}destroy(){for(const e in this._gpuSpriteHash)g.return(this._gpuSpriteHash[e]);this._gpuSpriteHash=null,this._renderer=null}}Se.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"sprite"};const L=class we{constructor(){this.clearBeforeRender=!0,this._backgroundColor=new de(0),this.color=this._backgroundColor,this.alpha=1}init(e){e={...we.defaultOptions,...e},this.clearBeforeRender=e.clearBeforeRender,this.color=e.background||e.backgroundColor||this._backgroundColor,this.alpha=e.backgroundAlpha,this._backgroundColor.setAlpha(e.backgroundAlpha)}get color(){return this._backgroundColor}set color(e){this._backgroundColor.setValue(e)}get alpha(){return this._backgroundColor.alpha}set alpha(e){this._backgroundColor.setAlpha(e)}get colorRgba(){return this._backgroundColor.toArray()}destroy(){}};L.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"background",priority:0};L.defaultOptions={backgroundAlpha:1,backgroundColor:0,clearBeforeRender:!0};let mt=L;const k={};E.handle(d.BlendMode,a=>{if(!a.name)throw new Error("BlendMode extension must have a name property");k[a.name]=a.ref},a=>{delete k[a.name]});class Pe{constructor(e){this._isAdvanced=!1,this._filterHash=Object.create(null),this._renderer=e}setBlendMode(e,t,r){if(this._activeBlendMode===t){this._isAdvanced&&this._renderableList.push(e);return}this._activeBlendMode=t,this._isAdvanced&&this._endAdvancedBlendMode(r),this._isAdvanced=!!k[t],this._isAdvanced&&(this._beginAdvancedBlendMode(r),this._renderableList.push(e))}_beginAdvancedBlendMode(e){this._renderer.renderPipes.batch.break(e);const t=this._activeBlendMode;if(!k[t]){ae(`Unable to assign BlendMode: '${t}'. You may want to include: import 'pixi.js/advanced-blend-modes'`);return}let r=this._filterHash[t];r||(r=this._filterHash[t]=new se,r.filters=[new k[t]]);const s={renderPipeId:"filter",action:"pushFilter",renderables:[],filterEffect:r,canBundle:!1};this._renderableList=s.renderables,e.add(s)}_endAdvancedBlendMode(e){this._renderableList=null,this._renderer.renderPipes.batch.break(e),e.add({renderPipeId:"filter",action:"popFilter",canBundle:!1})}buildStart(){this._isAdvanced=!1}buildEnd(e){this._isAdvanced&&this._endAdvancedBlendMode(e)}destroy(){this._renderer=null,this._renderableList=null;for(const e in this._filterHash)this._filterHash[e].destroy();this._filterHash=null}}Pe.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"blendMode"};const B={png:"image/png",jpg:"image/jpeg",webp:"image/webp"},z=class Re{constructor(e){this._renderer=e}_normalizeOptions(e,t={}){return e instanceof P||e instanceof m?{target:e,...t}:{...t,...e}}async image(e){const t=new Image;return t.src=await this.base64(e),t}async base64(e){e=this._normalizeOptions(e,Re.defaultImageOptions);const{format:t,quality:r}=e,s=this.canvas(e);if(s.toBlob!==void 0)return new Promise((n,i)=>{s.toBlob(o=>{if(!o){i(new Error("ICanvas.toBlob failed!"));return}const l=new FileReader;l.onload=()=>n(l.result),l.onerror=i,l.readAsDataURL(o)},B[t],r)});if(s.toDataURL!==void 0)return s.toDataURL(B[t],r);if(s.convertToBlob!==void 0){const n=await s.convertToBlob({type:B[t],quality:r});return new Promise((i,o)=>{const l=new FileReader;l.onload=()=>i(l.result),l.onerror=o,l.readAsDataURL(n)})}throw new Error("Extract.base64() requires ICanvas.toDataURL, ICanvas.toBlob, or ICanvas.convertToBlob to be implemented")}canvas(e){e=this._normalizeOptions(e);const t=e.target,r=this._renderer;if(t instanceof m)return r.texture.generateCanvas(t);const s=r.textureGenerator.generateTexture(e),n=r.texture.generateCanvas(s);return s.destroy(!0),n}pixels(e){e=this._normalizeOptions(e);const t=e.target,r=this._renderer,s=t instanceof m?t:r.textureGenerator.generateTexture(e),n=r.texture.getPixels(s);return t instanceof P&&s.destroy(!0),n}texture(e){return e=this._normalizeOptions(e),e.target instanceof m?e.target:this._renderer.textureGenerator.generateTexture(e)}download(e){e=this._normalizeOptions(e);const t=this.canvas(e),r=document.createElement("a");r.download=e.filename??"image.png",r.href=t.toDataURL("image/png"),document.body.appendChild(r),r.click(),document.body.removeChild(r)}log(e){const t=e.width??200;e=this._normalizeOptions(e);const r=this.canvas(e),s=r.toDataURL();console.log(`[Pixi Texture] ${r.width}px ${r.height}px`);const n=["font-size: 1px;",`padding: ${t}px 300px;`,`background: url(${s}) no-repeat;`,"background-size: contain;"].join(" ");console.log("%c ",n)}destroy(){this._renderer=null}};z.extension={type:[d.WebGLSystem,d.WebGPUSystem],name:"extract"};z.defaultImageOptions={format:"png",quality:1};let vt=z;class W extends m{static create(e){return new W({source:new T(e)})}resize(e,t,r){return this.source.resize(e,t,r),this}}const gt=new w,xt=new F,_t=[0,0,0,0];class Be{constructor(e){this._renderer=e}generateTexture(e){var u;e instanceof P&&(e={target:e,frame:void 0,textureSourceOptions:{},resolution:void 0});const t=e.resolution||this._renderer.resolution,r=e.antialias||this._renderer.view.antialias,s=e.target;let n=e.clearColor;n?n=Array.isArray(n)&&n.length===4?n:de.shared.setValue(n).toArray():n=_t;const i=((u=e.frame)==null?void 0:u.copyTo(gt))||$e(s,xt).rectangle;i.width=Math.max(i.width,1/t)|0,i.height=Math.max(i.height,1/t)|0;const o=W.create({...e.textureSourceOptions,width:i.width,height:i.height,resolution:t,antialias:r}),l=v.shared.translate(-i.x,-i.y);return this._renderer.render({container:s,transform:l,target:o,clearColor:n}),o.source.updateMipmaps(),o}destroy(){this._renderer=null}}Be.extension={type:[d.WebGLSystem,d.WebGPUSystem],name:"textureGenerator"};class Ue{constructor(e){this._stackIndex=0,this._globalUniformDataStack=[],this._uniformsPool=[],this._activeUniforms=[],this._bindGroupPool=[],this._activeBindGroups=[],this._renderer=e}reset(){this._stackIndex=0;for(let e=0;e<this._activeUniforms.length;e++)this._uniformsPool.push(this._activeUniforms[e]);for(let e=0;e<this._activeBindGroups.length;e++)this._bindGroupPool.push(this._activeBindGroups[e]);this._activeUniforms.length=0,this._activeBindGroups.length=0}start(e){this.reset(),this.push(e)}bind({size:e,projectionMatrix:t,worldTransformMatrix:r,worldColor:s,offset:n}){const i=this._renderer.renderTarget.renderTarget,o=this._stackIndex?this._globalUniformDataStack[this._stackIndex-1]:{projectionData:i,worldTransformMatrix:new v,worldColor:4294967295,offset:new qe},l={projectionMatrix:t||this._renderer.renderTarget.projectionMatrix,resolution:e||i.size,worldTransformMatrix:r||o.worldTransformMatrix,worldColor:s||o.worldColor,offset:n||o.offset,bindGroup:null},u=this._uniformsPool.pop()||this._createUniforms();this._activeUniforms.push(u);const c=u.uniforms;c.uProjectionMatrix=l.projectionMatrix,c.uResolution=l.resolution,c.uWorldTransformMatrix.copyFrom(l.worldTransformMatrix),c.uWorldTransformMatrix.tx-=l.offset.x,c.uWorldTransformMatrix.ty-=l.offset.y,Qe(l.worldColor,c.uWorldColorAlpha,0),u.update();let h;this._renderer.renderPipes.uniformBatch?h=this._renderer.renderPipes.uniformBatch.getUniformBindGroup(u,!1):(h=this._bindGroupPool.pop()||new Ke,this._activeBindGroups.push(h),h.setResource(u,0)),l.bindGroup=h,this._currentGlobalUniformData=l}push(e){this.bind(e),this._globalUniformDataStack[this._stackIndex++]=this._currentGlobalUniformData}pop(){this._currentGlobalUniformData=this._globalUniformDataStack[--this._stackIndex-1],this._renderer.type===O.WEBGL&&this._currentGlobalUniformData.bindGroup.resources[0].update()}get bindGroup(){return this._currentGlobalUniformData.bindGroup}get globalUniformData(){return this._currentGlobalUniformData}get uniformGroup(){return this._currentGlobalUniformData.bindGroup.resources[0]}_createUniforms(){return new te({uProjectionMatrix:{value:new v,type:"mat3x3<f32>"},uWorldTransformMatrix:{value:new v,type:"mat3x3<f32>"},uWorldColorAlpha:{value:new Float32Array(4),type:"vec4<f32>"},uResolution:{value:[0,0],type:"vec2<f32>"}},{isStatic:!0})}destroy(){this._renderer=null}}Ue.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"globalUniforms"};let bt=1;class Ae{constructor(){this._tasks=[],this._offset=0}init(){Y.system.add(this._update,this)}repeat(e,t,r=!0){const s=bt++;let n=0;return r&&(this._offset+=1e3,n=this._offset),this._tasks.push({func:e,duration:t,start:performance.now(),offset:n,last:performance.now(),repeat:!0,id:s}),s}cancel(e){for(let t=0;t<this._tasks.length;t++)if(this._tasks[t].id===e){this._tasks.splice(t,1);return}}_update(){const e=performance.now();for(let t=0;t<this._tasks.length;t++){const r=this._tasks[t];if(e-r.offset-r.last>=r.duration){const s=e-r.start;r.func(s),r.last=e}}}destroy(){Y.system.remove(this._update,this),this._tasks.length=0}}Ae.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"scheduler",priority:0};let ee=!1;function yt(a){if(!ee){if(ue.get().getNavigator().userAgent.toLowerCase().indexOf("chrome")>-1){const e=[`%c  %c  %c  %c  %c PixiJS %c v${J} (${a}) http://www.pixijs.com/

`,"background: #E72264; padding:5px 0;","background: #6CA2EA; padding:5px 0;","background: #B5D33D; padding:5px 0;","background: #FED23F; padding:5px 0;","color: #FFFFFF; background: #E72264; padding:5px 0;","color: #E72264; background: #FFFFFF; padding:5px 0;"];globalThis.console.log(...e)}else globalThis.console&&globalThis.console.log(`PixiJS ${J} - ${a} - http://www.pixijs.com/`);ee=!0}}class V{constructor(e){this._renderer=e}init(e){if(e.hello){let t=this._renderer.name;this._renderer.type===O.WEBGL&&(t+=` ${this._renderer.context.webGLVersion}`),yt(t)}}}V.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"hello",priority:-2};V.defaultOptions={hello:!1};function Tt(a){let e=!1;for(const r in a)if(a[r]==null){e=!0;break}if(!e)return a;const t=Object.create(null);for(const r in a){const s=a[r];s&&(t[r]=s)}return t}function kt(a){let e=0;for(let t=0;t<a.length;t++)a[t]==null?e++:a[t-e]=a[t];return a.length-=e,a}let Ct=0;const N=class Ie{constructor(e){this._managedRenderables=[],this._managedHashes=[],this._managedArrays=[],this._renderer=e}init(e){e={...Ie.defaultOptions,...e},this.maxUnusedTime=e.renderableGCMaxUnusedTime,this._frequency=e.renderableGCFrequency,this.enabled=e.renderableGCActive}get enabled(){return!!this._handler}set enabled(e){this.enabled!==e&&(e?(this._handler=this._renderer.scheduler.repeat(()=>this.run(),this._frequency,!1),this._hashHandler=this._renderer.scheduler.repeat(()=>{for(const t of this._managedHashes)t.context[t.hash]=Tt(t.context[t.hash])},this._frequency),this._arrayHandler=this._renderer.scheduler.repeat(()=>{for(const t of this._managedArrays)kt(t.context[t.hash])},this._frequency)):(this._renderer.scheduler.cancel(this._handler),this._renderer.scheduler.cancel(this._hashHandler),this._renderer.scheduler.cancel(this._arrayHandler)))}addManagedHash(e,t){this._managedHashes.push({context:e,hash:t})}addManagedArray(e,t){this._managedArrays.push({context:e,hash:t})}prerender({container:e}){this._now=performance.now(),e.renderGroup.gcTick=Ct++,this._updateInstructionGCTick(e.renderGroup,e.renderGroup.gcTick)}addRenderable(e){this.enabled&&(e._lastUsed===-1&&(this._managedRenderables.push(e),e.once("destroyed",this._removeRenderable,this)),e._lastUsed=this._now)}run(){var n;const e=this._now,t=this._managedRenderables,r=this._renderer.renderPipes;let s=0;for(let i=0;i<t.length;i++){const o=t[i];if(o===null){s++;continue}const l=o.renderGroup??o.parentRenderGroup,u=((n=l==null?void 0:l.instructionSet)==null?void 0:n.gcTick)??-1;if(((l==null?void 0:l.gcTick)??0)===u&&(o._lastUsed=e),e-o._lastUsed>this.maxUnusedTime){if(!o.destroyed){const c=r;l&&(l.structureDidChange=!0),c[o.renderPipeId].destroyRenderable(o)}o._lastUsed=-1,s++,o.off("destroyed",this._removeRenderable,this)}else t[i-s]=o}t.length-=s}destroy(){this.enabled=!1,this._renderer=null,this._managedRenderables.length=0,this._managedHashes.length=0,this._managedArrays.length=0}_removeRenderable(e){const t=this._managedRenderables.indexOf(e);t>=0&&(e.off("destroyed",this._removeRenderable,this),this._managedRenderables[t]=null)}_updateInstructionGCTick(e,t){e.instructionSet.gcTick=t;for(const r of e.renderGroupChildren)this._updateInstructionGCTick(r,t)}};N.extension={type:[d.WebGLSystem,d.WebGPUSystem],name:"renderableGC",priority:0};N.defaultOptions={renderableGCActive:!0,renderableGCMaxUnusedTime:6e4,renderableGCFrequency:3e4};let Mt=N;const j=class Ge{constructor(e){this._renderer=e,this.count=0,this.checkCount=0}init(e){e={...Ge.defaultOptions,...e},this.checkCountMax=e.textureGCCheckCountMax,this.maxIdle=e.textureGCAMaxIdle??e.textureGCMaxIdle,this.active=e.textureGCActive}postrender(){this._renderer.renderingToScreen&&(this.count++,this.active&&(this.checkCount++,this.checkCount>this.checkCountMax&&(this.checkCount=0,this.run())))}run(){const e=this._renderer.texture.managedTextures;for(let t=0;t<e.length;t++){const r=e[t];r.autoGarbageCollect&&r.resource&&r._touched>-1&&this.count-r._touched>this.maxIdle&&(r._touched=-1,r.unload())}}destroy(){this._renderer=null}};j.extension={type:[d.WebGLSystem,d.WebGPUSystem],name:"textureGC"};j.defaultOptions={textureGCActive:!0,textureGCAMaxIdle:null,textureGCMaxIdle:60*60,textureGCCheckCountMax:600};let St=j;const $=class De{get autoDensity(){return this.texture.source.autoDensity}set autoDensity(e){this.texture.source.autoDensity=e}get resolution(){return this.texture.source._resolution}set resolution(e){this.texture.source.resize(this.texture.source.width,this.texture.source.height,e)}init(e){e={...De.defaultOptions,...e},e.view&&(Ye(Je,"ViewSystem.view has been renamed to ViewSystem.canvas"),e.canvas=e.view),this.screen=new w(0,0,e.width,e.height),this.canvas=e.canvas||ue.get().createCanvas(),this.antialias=!!e.antialias,this.texture=xe(this.canvas,e),this.renderTarget=new I({colorTextures:[this.texture],depth:!!e.depth,isRoot:!0}),this.texture.source.transparent=e.backgroundAlpha<1,this.resolution=e.resolution}resize(e,t,r){this.texture.source.resize(e,t,r),this.screen.width=this.texture.frame.width,this.screen.height=this.texture.frame.height}destroy(e=!1){(typeof e=="boolean"?e:!!(e!=null&&e.removeView))&&this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas)}};$.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"view",priority:0};$.defaultOptions={width:800,height:600,autoDensity:!1,antialias:!1};let wt=$;const Ht=[mt,Ue,V,wt,Me,St,Be,vt,Xe,Mt,Ae],Lt=[Pe,fe,Se,Te,me,ge,ve,ye];export{Ft as B,_ as G,Ot as R,Ht as S,Gt as U,Lt as a,ot as b,Dt as c,M as d,It as e,At as f,Ut as t,Et as u};
