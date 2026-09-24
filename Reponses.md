# Reponses 

## Partie 1 : prendre en main Apollo Sandbox

### 1.1 Explorer le schéma
-- Le type query propose 6 point d'entre : 
        users
        user(...)
        products
        product(...)
        orders
        order(...)
-- Product possede les champs :
        stock:-
        price
        name
        id
        brandId
-- OrderStatus peut prendre les valeur :
        PENDING
        SHIPPED
        DELIVERED
        CANCELLED

### 1.2 Votre première query
    #### Requete initial
        Respose_Screnn\1.2-req_res_initial_req.png   
    #### Requete modifier pour name uniquement 
        Respose_Screnn\1.2-req_res_name.png
    #### Requete modifier pour name, stock et brandId uniquement 
            Respose_Screnn\1.2-req_res_name_stock_brandId.png

### 1.3 Une query avec un argument
    #### Nom et le prix du seul article d'identifiant `3`.
        Respose_Screnn\1.3-req_res_name&price_product_3.png
    #### Avec variable 
        Respose_Screnn\1.3-req_res_name&price_product_3_Avec_variable.png
    #### Avec id: 999
        Respose_Screnn\1.3-req_res_name&price_product_999.png

### 1.4 Suivre les relations
    #### requête qui renvoie, pour chaque commande : son identifiant, son état, l'email du client, et pour chaque ligne la quantité et le nom de l'article commandé.
        Respose_Screnn\1.4-req_res_1.png
    #### la requête inverse : le prénom du client `1` et la liste des identifiants et des états de  ses commandes.
        Respose_Screnn\1.4-req_res_2.png

### 1.5 Alias et fragments
    #### une seule requête, récupérez les articles `1` et `8` avec les mêmes champs
        Respose_Screnn\1.5-req_res_1.png

### 1.6 Créer des données
    #### créez un client avec `createUser`, en renvoyant son `id` et son`email             
        Respose_Screnn\1.6-req_res_1.png 
    #### vérifiez avec la query `users` qu'il a bien été ajouté, et notez son identifiant
        Respose_Screnn\1.6-req_res_2.png
    #### créez un article avec `createProduct`
        Respose_Screnn\1.6-req_res_3.png

### 1.7 Modifier des données, et lire les erreurs
    #### Faites passer la commande `2` à l'état `DELIVERED` avec `updateOrderStatus`,puis vérifiez le résultat avec la query `order`.
        Respose_Screnn\1.7-req_res_1.png
    ####`updateOrderStatus` avec `orderId: "99"
        Respose_Screnn\1.7-req_res_2.png
    #### `updateOrderStatus` avec `status: ENVOYEE`
        Respose_Screnn\1.7-req_res_3.png
    #### query qui demande le champ `taille` sur un article
        Respose_Screnn\1.7-req_res_4.png
    Ce qui differencie ses deux cas c'est que dans le 1 c'est l'entrer qu'il ne trouve pas . Parcontre dans les deux autres c'est un champs/donner su'il ne trouve pas . Dans le premier cas c'est directement detecter au niveau du resolver mais dans les deux second cas c'est plus au niveau de la schema/db

### 1.8 Ce qui manque
    Le serveur refuse le champs brand parcequ'il n'est pas encore declarer dans typeDefs


## Partie 2 : écrire des typeDefs et des resolvers
### Exercice 1 : un nouveau type et une query 
    Voir code 
### Exercice 2 : une query avec un argument
    
