import { useTheme } from "@/hooks/useThemeStore";
import { getShadow } from "@/themes/tokens";
import { addOpacity } from "@/utils/colorGenerator";
import React from "react";
import { StyleSheet, View } from "react-native";

// Cache de styles pour optimisation
const STYLE_CACHE = new Map();
const MAX_CACHE_SIZE = 100;

// Maps pré-calculées pour éviter les conditions
const ALIGN_ITEMS_MAP = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
};

const JUSTIFY_CONTENT_MAP = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
};

// Styles de base pré-créés avec StyleSheet pour optimisation
const COMMON_STYLES = StyleSheet.create({
    vertical: {
        width: "100%",
        flexDirection: "column",
    },
    horizontal: {
        width: "100%",
        flexDirection: "row",
    },
});

// Fonction de nettoyage du cache
const cleanupCache = () => {
    if (STYLE_CACHE.size > MAX_CACHE_SIZE) {
        // Convertir en array pour garder les plus récents
        const entries = Array.from(STYLE_CACHE.entries());
        STYLE_CACHE.clear();
        // Garder seulement les 50 entrées les plus récentes
        entries.slice(-50).forEach(([key, value]) => {
            STYLE_CACHE.set(key, value);
        });
    }
};

function Stack({
    direction = "vertical",
    gap = 4,
    width = "100%",
    height,
    padding = 0,
    margin = 0,
    vAlign = "start",
    hAlign = "start",
    inline = false,
    flex = false,
    backgroundColor,
    radius = 0,
    card = false,
    flat = false,
    bordered = false,
    style,
    children,
    ...rest
}) {
    const theme = useTheme();
    const { colors } = theme;

    // Génération de la clé de cache unique basée sur toutes les props qui affectent le style
    const cacheKey = React.useMemo(() => {
        return [
            direction,
            gap,
            width,
            height,
            Array.isArray(padding) ? padding.join(",") : padding,
            margin,
            vAlign,
            hAlign,
            inline,
            flex,
            backgroundColor || "",
            radius,
            card,
            flat,
            bordered,
            theme.name, // Important : le cache est global, il doit distinguer les thèmes
        ].join("-");
    }, [
        direction,
        gap,
        width,
        height,
        padding,
        margin,
        vAlign,
        hAlign,
        inline,
        flex,
        backgroundColor,
        radius,
        card,
        flat,
        bordered,
        theme.name,
    ]);

    // Calcul des styles avec mise en cache
    const computedStyle = React.useMemo(() => {
        // 1. Vérifier si le style existe déjà en cache
        const cached = STYLE_CACHE.get(cacheKey);
        if (cached) {
            return cached;
        }

        // 2. Utiliser le style de base pré-créé
        const baseStyle =
            direction === "vertical"
                ? COMMON_STYLES.vertical
                : COMMON_STYLES.horizontal;

        // 3. Construire le style dynamique
        const dynamicStyle = {
            gap,
            margin,
            width,
            height,
            alignItems: ALIGN_ITEMS_MAP[hAlign],
            justifyContent: JUSTIFY_CONTENT_MAP[vAlign],
        };

        // Gestion du padding (array ou number)
        if (Array.isArray(padding)) {
            dynamicStyle.paddingHorizontal = padding[0];
            dynamicStyle.paddingVertical = padding[1];
        } else {
            dynamicStyle.padding = padding;
        }

        // Ajouter backgroundColor si défini
        if (backgroundColor) {
            dynamicStyle.backgroundColor = backgroundColor;
        }

        // Gestion du border radius
        if (radius > 0) {
            dynamicStyle.borderRadius = radius;
            dynamicStyle.borderCurve = "continuous";
        }

        // Mode inline
        if (inline) {
            dynamicStyle.alignSelf = "center";
            dynamicStyle.width = width !== undefined ? width : "auto";
            dynamicStyle.flex = flex ? 1 : 0;
        }

        // Style card
        if (card) {
            Object.assign(dynamicStyle, {
                borderRadius: radius || 20,
                borderCurve: "continuous",
                backgroundColor: backgroundColor || colors.surface.default,
                overflow: "visible",
            });

            if (flat) {
                // Style card flat (sans ombrage)
                Object.assign(dynamicStyle, {
                    shadowColor: "transparent",
                    shadowOpacity: 0,
                    borderWidth: 1,
                    borderColor: addOpacity(colors.text.primary, 0.15),
                });
            } else {
                // Style card avec ombrage
                Object.assign(dynamicStyle, {
                    shadowColor: getShadow(theme.isDark).color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.16,
                    shadowRadius: 1.5,
                    elevation: 1,
                    borderWidth: 0.5,
                    borderColor: addOpacity(colors.text.primary, 0.15),
                });
            }
        }

        // Style bordered
        if (bordered) {
            Object.assign(dynamicStyle, {
                borderRadius: radius || 20,
                borderCurve: "continuous",
                borderColor: colors.border.subtle,
                borderWidth: 1,
                backgroundColor: backgroundColor || colors.surface.default,
            });
        }

        // 4. Combiner les styles
        const finalStyle = [baseStyle, dynamicStyle];

        // 5. Mettre en cache le résultat
        STYLE_CACHE.set(cacheKey, finalStyle);

        // 6. Nettoyage automatique du cache si nécessaire
        cleanupCache();

        return finalStyle;
    }, [cacheKey, colors]);

    return (
        <View {...rest} style={[computedStyle, style]}>
            {children}
        </View>
    );
}

// Fonction utilitaire pour debugger le cache (optionnel)
Stack.getCacheStats = () => ({
    size: STYLE_CACHE.size,
    maxSize: MAX_CACHE_SIZE,
    keys: Array.from(STYLE_CACHE.keys()).slice(0, 10), // Premières 10 clés
    usage: `${((STYLE_CACHE.size / MAX_CACHE_SIZE) * 100).toFixed(1)}%`,
});

// Fonction pour vider le cache (optionnel)
Stack.clearCache = () => {
    STYLE_CACHE.clear();
};

export default Stack;

