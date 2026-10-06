# Prepares the hero photos in public/media/msg from MSG's originals (needs python3, opencv-python-headless, numpy).
# Usage, from msg-horizons/: python3 scripts/prepare-hero-photos.py <folder-with-originals>
# What it changes, and only this: restores the real sign lettering from the original photo (the retouched copy had
# garbled it), removes litter and a stain from the road, builds the sky layer and the sign-glow layer, and crops the
# inside views. Nothing is added to the buildings.
import sys
import cv2, numpy as np
I=sys.argv[1].rstrip('/')+'/'  # folder with MSG's originals: 7.jpg (original facade), 8.jpg (retouched facade), 9.jpg and 11.jpg (inside)
OUT='public/media/msg/'
fac=cv2.imread(I+'8.jpg'); orig=cv2.imread(I+'7.jpg')
H,W=fac.shape[:2]

# 1) restore the real sign: the retouched photo garbled the lettering, so the sign comes from the original photo
src=np.float32([[781,61],[778,148],[531,156],[532,73]])
dst=np.float32([[751,153],[747,250],[469,253],[470,161]])
M=cv2.getPerspectiveTransform(src,dst)
warp=cv2.warpPerspective(orig,M,(W,H),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE)
mask=np.zeros((H,W),np.uint8); cv2.fillPoly(mask,[dst.astype(np.int32)],255)
inner=cv2.erode(mask,np.ones((5,5),np.uint8))
# tone: map the original's black/white to the retouched photo's black/white, per channel
s_px=warp[inner>0].astype(np.float32); d_px=fac[inner>0].astype(np.float32)
def lo_hi(px): 
    L=px.mean(1); return px[L<np.percentile(L,40)].mean(0), px[L>np.percentile(L,96)].mean(0)
slo,shi=lo_hi(s_px); dlo,dhi=lo_hi(d_px)
tone=(warp.astype(np.float32)-slo)/(shi-slo)
tone=np.clip(tone,0,1)
# a gentle S-curve keeps the two-tone sign crisp
tone=tone*tone*(3-2*tone)
tone=dlo+tone*(dhi-dlo)
tone=np.clip(tone,0,255).astype(np.uint8)
blur=cv2.GaussianBlur(tone,(0,0),1.1); tone=cv2.addWeighted(tone,1.7,blur,-0.7,0)
fm=cv2.GaussianBlur(cv2.erode(mask,np.ones((3,3),np.uint8)).astype(np.float32)/255,(0,0),0.8)[...,None]
fac=(fac*(1-fm)+tone*fm).astype(np.uint8)

# 2) tidy the road: litter and a stain, filled from clean asphalt nearby
def patch(x0,y0,x1,y1,dx,dy,pad=6):
    global fac
    x0-=pad;y0-=pad;x1+=pad;y1+=pad
    x0=max(x0,0); y0=max(y0,0); x1=min(x1,W-1); y1=min(y1,H-1)
    srcp=fac[y0+dy:y1+dy, x0+dx:x1+dx].copy()
    m=np.full(srcp.shape[:2],255,np.uint8)
    m[:2,:]=0;m[-2:,:]=0;m[:,:2]=0;m[:,-2:]=0
    c=((x0+x1)//2,(y0+y1)//2)
    fac=cv2.seamlessClone(srcp,fac,m,c,cv2.NORMAL_CLONE)
patch(124,758,262,814,170,0)
patch(3,728,96,762,300,0)
patch(580,742,608,760,0,150)
patch(1204,732,1254,752,-70,0)
patch(1096,932,1136,954,0,60)
patch(1098,698,1138,716,0,36)
cv2.imwrite(OUT+'facade.jpg',fac,[cv2.IMWRITE_JPEG_QUALITY,90])

# 3) the sky plate: sky only, extended a little below the roofline so it can drift behind the building
roof=np.array([[0,272],[30,272],[31,204],[622,135],[1412,203],[1448,199]],np.float32)
def roof_y(x): return np.interp(x,roof[:,0],roof[:,1])
sky=fac.copy()
for x in range(W):
    yr=int(roof_y(x))-3
    for k in range(0,90):
        y=yr+k; sy=max(0,yr-1-k)
        if y<H: sky[y,x]=fac[sy,x]
sky=cv2.GaussianBlur(sky,(0,0),0.6)
cv2.imwrite(OUT+'facade-sky.jpg',sky[0:330],[cv2.IMWRITE_JPEG_QUALITY,86])

# 4) sign glow: the letters alone, as light
x0,y0,x1,y1=469,153,752,254
crop=fac[y0:y1,x0:x1]
L=cv2.cvtColor(crop,cv2.COLOR_BGR2GRAY).astype(np.float32)
qm=mask[y0:y1,x0:x1]
a=np.clip((L-150)/70,0,1)*(qm>0)
# only the main lettering glows (not the small registration plate or the corner badge)
hh,ww=a.shape
keep=np.zeros_like(a); keep[int(hh*0.2):int(hh*0.72), int(ww*0.12):int(ww*0.86)]=1
a=a*keep
rgba=np.dstack([np.full_like(L,255),np.full_like(L,250),np.full_like(L,240),a*255]).astype(np.uint8)
cv2.imwrite(OUT+'sign-glow.png',rgba)

# 5) inside: wide (landscape) and tall (portrait) views of the same floor
ins=cv2.imread(I+'11.jpg')[0:950,0:1260]
cv2.imwrite(OUT+'interior.jpg',ins,[cv2.IMWRITE_JPEG_QUALITY,88])
tall=cv2.imread(I+'9.jpg')
cv2.imwrite(OUT+'interior-portrait.jpg',tall,[cv2.IMWRITE_JPEG_QUALITY,88])
print('done', fac.shape, ins.shape, tall.shape)
