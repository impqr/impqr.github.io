# 联邦学习

联邦学习是一种在计算过程中分享中间统计结果而不泄露原始数据的分布式算法框架，实现了数据在多中心协同计算中的隐私保护。其特点是在保护原始数据隐私安全的同事，又能保证计算结果准确性和精度。

联邦学习一般认为有两种架构：

- 客户端/服务器模式：一般使用于预测全局模型参数和开展各种统计学检验。
- 去中心化模式：适用于各种分布式算法，如稀疏线性回归、主成分分析、支持向量机等。



## 分类

### 横向联邦学习

横向联邦学习的本质是样本的联合，适用于参与机构间业态相同但触达客户不同的场景，这种情况往往特征重叠多，用户重叠少。

比如罕见病研究中，每个医院病历的数据纬度基本一致，但它们分别有自己不同的病人，并且病历样本有限，通过联邦学习可以让这些来自不同机构的样本在保障隐私的前提下共享，提高模型训练的能力。



### 纵向联邦学习

纵向联邦学习的本质是特征的联合，适用于各参与机构间用户重叠多，特征重叠少的场景。

比如同一个地区的银行、电商公司、运营商。他们的用户集可能包含该地区的大多数居民，但银行记录了用户的收支行为相关数据，电商公司保留了用户的购买行为相关数据，运营商有其他的未知数据，所以其特征空间有很大的不同。



### 迁移联邦学习

迁移联邦学习适用于两个数据集的重叠较少，不仅样本不同，而且特征空间也有很大差异的场景。

比如两个机构，一个是位于北京的电商平台，一个是位于杭州的物流公司。由于地域限制两个机构的用户群体交叉点小，由于业务不同，双方的特征空间重叠也少。