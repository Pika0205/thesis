import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import sys
import numpy as np
from pylab import mpl

#single
y_tick = ["TO1+0", "TO1+50", "TO1+100", "TO1+150", "TO1+200", "TO1+250", "TO1+300", "TO1+350", "TO1+400", "TO1+450", "TO1+500"]


#8MB
abc = []
x_tick = []
for numNode in range(6):
    head = int(sys.argv[numNode + 3])
    tail = head + 2050
    abc = []
    for i in range(head, tail, 50) :
        abc.append(i)
    x_tick.append(abc)
    
    
#print("x_tick : ", x_tick)


data = {}
country = ["A","C","L","P","T","S", "All"];
titleList = ["Oregon", "Canada", "London", "Paris", "Tokyo", "Seoul"]

i = 0
while  i < 6: 
    title = "6node-" + sys.argv[1] + "MB-" + sys.argv[2] + "-" + country[i]
    filename = title + "-grayMap.txt"
    #title = titleList[i] + "-4MB(6node)"


    ele = []
    with open(filename) as file : 
        for line in file : 
            line = line.strip().split(',')
            ele.append(list(map(float,line)))
            
    ele_array = np.array(ele)

    file.close()


    ele_array = np.array(ele_array).reshape( len(y_tick) , len(x_tick[i]) )
    #print(ele_array)
    print( np.where( ele_array==np.max(ele_array) ) )


    pd_data=pd.DataFrame(ele_array, index=y_tick, columns=x_tick[i])

    mpl.rcParams['font.family'] = 'Calibri'
    mpl.rcParams['font.sans-serif'] = 'NSimSun,Calibri'
    font = {'family': 'Calibri',
                'color': 'k',
                'weight': 'normal',
                'size': 20,}


    f, ax = plt.subplots(figsize=(16, 8))
    #cmap = sns.cm.rocket  
    cmap = sns.cm.rocket_r#colorbar颜色反轉
    #camp = ""YlGnBu_r""
    #plt.figure(figsize = (10,16))



    ax = sns.heatmap(pd_data, annot=False, ax=ax, fmt='.3f', cmap=cmap, annot_kws={"size":20}, xticklabels = 2) #畫heatmap
    #ax = sns.heatmap(pd_data, annot=False, ax=ax, fmt='.2f', cmap=cmap, annot_kws={"size":20}, yticklabels = 1, vmin=1500, vmax=12000) #畫heatmap

    #字體大小在“annot_kws”中设置 . False不顯示數值於圖上
    #annot 為要不要在圖上顯示每一個的數值
    #yticklabels和xticklabels可以調整刻度要多久畫一條



    #plt.title(name1 + "\nsimulation result",fontsize=30)
    #plt.title("TO2 = TO1 + " + abc,fontsize=30)
    #plt.title(title,fontsize=30)





    plt.xticks(rotation = 30)
    plt.yticks(rotation = 0)
    plt.xlabel("TO1 (ms)",fontsize=17.5, color='k') #x軸label的文字和字體大小
    #plt.ylabel("time         \nout 2          \n(ms)         ",fontsize=17.5, color='k', rotation = 0) #y軸label的文字和字體大小
    #plt.ylabel("TO1          \n(ms)         ",fontsize=17.5, color='k', rotation = 0) #y軸label的文字和字體大小
    plt.ylabel("TO2          \n(ms)          ",fontsize=17.5, color='k', rotation = 0) #y軸label的文字和字體大小

    plt.xticks(fontsize=15) #x軸刻度的字體大小（文字包含在pd_data中了）
    plt.yticks(fontsize=15) #y軸刻度的字體大小（文字包含在pd_data中了）



    #設置colorbar的刻度字體大小
    #cax = plt.gcf().axes[-1] 
    #cax.tick_params(labelsize=20)


    #设置colorbar的label文字和字體大小
    #cbar = ax.collections[0].colorbar
    #cbar.set_label("MB / s",fontdict=font)
    #cbar.set_label("ms",fontdict=font)

    plt.savefig('C:\\Users\BIU\\Desktop\\' + title +'.png')#儲存圖片
    #plt.show()
    i = i + 1