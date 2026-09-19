import { Section, Text } from "@/components";
import { Link } from "@/components/svg";
import { openUrl } from "@/utils/url";
import { fetch } from "expo/fetch";
import { memo, useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import SettingSectionLayout from "../components/SettingSectionLayout";
import { logger } from "@/utils/logger";

export default function ContributorsScreen({ route }) {
    const { label } = route.params;

    const [contributors, setContributors] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const url =
            "https://api.github.com/repos/Kolybri-Lab/EcoleDirectePlus-Mobile/contributors?per_page=100";
        logger.log(`[FETCH] GET ${url}`);
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("Erreur GitHub API");
                return res.json();
            })
            .then(setContributors)
            .catch((e) => setError(e.message));
    }, []);

    if (error) return <Text>{error}</Text>;
    if (!contributors) return <ActivityIndicator />;

    return (
        <SettingSectionLayout label={label}>
            <View style={{ gap: 5 }}>
                {contributors.map((item, index) => (
                    <Contributor
                        key={item.id}
                        item={item}
                        index={index}
                        totalLength={contributors.length}
                    />
                ))}
            </View>
        </SettingSectionLayout>
    );
}

const Contributor = memo(({ item, index, totalLength }) => {
    const { login, avatar_url, contributions, html_url } = item;

    return (
        <Section
            height={72}
            icon={
                <Image
                    source={{ uri: avatar_url }}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                />
            }
            label={login}
            subtitle={`${contributions} contributions`}
            totalLength={totalLength}
            index={index}
            onPress={() => openUrl(html_url)}
        >
            <Link size={24} fill="hsla(0, 0%, 100%, 0.3)" />
        </Section>
    );
});
