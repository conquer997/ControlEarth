window.CONTROL_EARTH={
title:'ControlEarth: Controllable Ultra-High-Resolution Image Generation for Earth Observation',
authors:['Ziqi Ye','Zepeng Xin','Zhen Zou','Danfeng Li','Ziyang Gong','Hongruixuan Chen','Di Wang','Xiaoxing Hu','Yue Zhou','Xue Yang','Haipeng Wang','Yansheng Li','Naoto Yokoya','Junchi Yan'],
resources:{Paper:null,Code:null,Dataset:null,Model:null},
scenes:[
{name:'Industrial district',key:'harbour',source:'iSAID_P2766_00.png'},
{name:'Logistics · Christchurch',key:'christchurch',source:'AIRS_christchurch_173_13.png'},
{name:'Parks & sports',key:'airfield',source:'iSAID_P1410_10.png'},
{name:'Rural mosaic',key:'countryside',source:'HRSCD_14-2005-0430-6885-LA93_11.png'},
{name:'Residential blocks',key:'urban',source:'WHU-Building_train_the_whole_aerial_image_35_65.png'},
{name:'Las Vegas',key:'vegas',source:'SN2_Vegas_15OCT22183656-S2AS_R6C2-056155973040_01_P001_2_2.png'}
],
details:[
{name:'Airport',key:'airport',source:'P1871_21.png',regions:[[.46,.12,.15,.15],[.10,.354,.18,.18],[.63,.68,.18,.18]]},
{name:'Neighborhood',key:'neighborhood',source:'WHU-Building_train_the_whole_aerial_image_35_25.png',regions:[[.10,.10,.15,.15],[.43,.59,.14,.14],[.03,.73,.24,.24]]},
{name:'Fields & woodland',key:'fields',source:'HRSCD_35-2006-0365-6825-LA93_21.png',regions:[[.15,.15,.18,.18],[.50,.40,.18,.18],[.65,.68,.18,.18]]},
{name:'Airport perimeter',key:'port',source:'iSAID_P1809_11.png',regions:[[.18,.15,.18,.18],[.48,.44,.18,.18],[.68,.68,.18,.18]]},
{name:'Urban hills · Rio',key:'rio',source:'SN1_Rio_013022232022_2_7.png',regions:[[.15,.15,.18,.18],[.48,.42,.18,.18],[.65,.67,.18,.18]]},
{name:'Riverfront · Austin',key:'austin',source:'InriaAerialImageLabeling_austin33_00.png',regions:[[.15,.15,.18,.18],[.50,.40,.18,.18],[.66,.68,.18,.18]]}
],tasks:[
['Semantic Segmentation','Semantic layouts guide category content and spatial regions, providing image–label pairs for segmentation training.'],
['Object Detection','Object conditions guide scene generation for additional detection training examples.'],
['Scene Classification','Scene conditions support class-oriented synthesis for training image classifiers.'],
['Building Extraction','Building layouts guide synthesis of training imagery with corresponding extraction supervision.'],
['Road Extraction','Road conditions guide synthesis around connected spatial structures.'],
['Flood Detection','Task-specific flood conditions support synthetic training data for flood region prediction.']
],
// Corrected author-supplied record: Flood / SegFormer / few-shot / 3x = 62.85 / 77.67.
floodFewShot:{baseline:[58.81,74.16],threeTimes:[62.85,77.67],fourTimes:[63.81,77.93]},
citation:'@misc{controlearth,\n  title = {ControlEarth: Controllable Ultra-High-Resolution Image Generation for Earth Observation},\n  author = {Ye, Ziqi and Xin, Zepeng and Zou, Zhen and Li, Danfeng and Gong, Ziyang and Chen, Hongruixuan and Wang, Di and Hu, Xiaoxing and Zhou, Yue and Yang, Xue and Wang, Haipeng and Li, Yansheng and Yokoya, Naoto and Yan, Junchi}\n}'
};
