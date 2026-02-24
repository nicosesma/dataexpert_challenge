### Students Schema
Email - String (Unique)
Last Name - String
First Name - String
Middle Name - String
DOB - String
Birth City - String
Birth State - String
Birth County - String
Birth Country - String
Address Street - String
Address APT - String
Address County - String
Address City - String
Address State - String
Address Zip Code - String
Phone Number - String
Driving Permit Number - String
Driving Permit State - String
Driving Permit Issue Date - String
Driving Permit Expire Date - String
Age - Number
Gender - String
Eye Color - String
Hair Color - String
Race - String
Ethnicity - String
Weight - Number
Height - String
Father Last Name - String
Mother Last Name - String
Primary Contact Name - String
Primary Contact Phone - String
Primary Contact Address - String
Secondary Contact Name - String
Secondary Contact Phone - String
Secondary Contact Address - String


### Students Google Spreadsheet Schema (Cell Name / Cell Number)
Timestamp
Email Address
1. "Last Name / Apellido(s) * Como aparece en su Documento:"
2. First Name / Nombre:
3. Middle Name / Segundo Nombre:
4. Date of Birth (MM/DD/YY) / Fecha de Nacimiento (MM/DD/AA):
5. Place of Birth (City) / Lugar de Nacimiento (Ciudad):
6. State of Birth / Estado de Nacimiento
7. County of Birth (Only for USA Born)
8. Place of Birth (Country) / Lugar de Nacimiento (Pais)
9. Street Address / Direccion (Numero y Calle):
10. Apt. Number/ Numero de Apartamento:
11. County / Condado
12. City / Ciudad:
13. State / Estado:
14. Zip Code / Codigo Postal:
15. Phone Number (Area Code + Number) / Numero de Telefono (Codigo de Area + Numero):
16. Driving Permit Number or ID (If you have it) / Numero de Permiso de Manejo o ID (si lo tiene):
17. What state is your Driving License or ID? (Only if you have it) / De que Estado es su Licencia de manejo o ID? (Solo si lo tiene):
18. Driving License or ID Issue date (Only if you have it) (Month/Day/Year) / Fecha de Emision de su Licencia de manejo o ID (Solo si lo tiene) (Mes/Dia/Ano):
19. Driving License or ID Expire date (Only if you have it) (Month/Day/Year) / Fecha de Vencimiento de su Licencia de manejo o ID (Solo si lo tiene) (Mes/Dia/Ano):
20. Age / Edad:
21. Column 22
22. Eye Color / Color de Ojos
23. Hair color / Color de cabello:
24. Race / Raza
25. Ethnicity / Etnia
26. Weight (Lbs.) / Peso (Libras)
27. Height (Ft./In.) / Altura (Pies/Pulgadas):
28. Father's Last Name / Apellido del Padre:
29. Mother's Last Name / Apellido de la Madre:
30. Contact Name / Nombre del Contacto:
31. Phone Number / Numero Telefonico:
32. Adress / Direccion:
33. Contact Name / Nombre del Contacto:
34. Phone Number / Numero Telefonico:
35. Adress / Direccion:


### Map Student Schema to Spreadsheet (Property - (CellId))
Email - (B)
Last Name - (C)
First Name - (D)
Middle Name - (E)
DOB - (F)
Birth City - (G)
Birth State - (H)
Birth County - (I)
Birth Country - (J)
Address Street - (K)
Address APT - (L)
Address County - (M)
Address City - (N)
Address State - (O)
Address Zip Code - (P)
Phone Number - (Q)
Driving Permit Number - (R)
Driving Permit State - (S)
Driving Permit Issue Date - (T)
Driving Permit Expire Date - (U)
Age - (V)
Gender - (W)
Eye Color - (X)
Hair Color - (Y)
Race - (Z)
Ethnicity - (AA)
Weight - (AB)
Height - (AC)
Father Last Name - (AD)
Mother Last Name - (AE)
Primary Contact Name - (AF)
Primary Contact Phone - (AG)
Primary Contact Address - (AH)
Secondary Contact Name - (AI)
Secondary Contact Phone - (AJ)
Secondary Contact Address - (AK)

## PDF Form Details
*Use /assets/TEMPLATE.pdf*

### PDF Form Fields map to state schema (PDF "Field Name" - State Schema `${Property}`)
"Full Legal Name" - `${First Name} ${Middle Name} ${Last Name}`
"DOB" - `${DOB}`
"Driver License" - `${Driving Permit Number}`
"Phone Number 1" - `${Phone Number}`
"Address" - `${Address Street} ${Address APT}`
"City" - `${Address City}`
"State" - `${Address State}`
"Zip Code" - `${Address Zip Code}`
"Printed Name of Student" - `${First Name} ${Middle Name} ${Last Name}`
"LAST Name" - `${Last Name}`
"FIRST Name" - `${First Name}`
"MIDDLE Name" - `${Middle Name}`
"Age" - `${Age}`
"Weight" - `${Weight}`
"EMAIL" - `${Email}`
