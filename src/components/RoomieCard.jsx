import React from "react";
import * as Avatar from "@radix-ui/react-avatar";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Star, MapPin, Home, Users, DollarSign, Verified } from "lucide-react";
import './RoomieCard.css';

// Importa los componentes de Radix Themes
import {
  Card,
  Flex,
  Text,
  Badge,
  Box,
  Heading,
} from "@radix-ui/themes";

export default function RoommateCard({ roommate = {}, onClick = () => {}, view = 'grid' }) {
  return (
    <Tooltip.Provider>
      <Card
        asChild
        size="2"
        className="property-card cursor-pointer"
        onClick={() => onClick(roommate)}
      >
        <Flex direction="column" gap="4">
          <Flex direction={view === 'list' ? 'column' : 'row'} gap="2" m="1rem" minWidth="15rem" className="roomie-card-header">
            {/* Avatar con verificación */}
            <Box position="relative" className="avatar-wrap">
              <Avatar.Root className="avatar">
                <Avatar.Image
                  src={roommate?.avatar || ""}
                  alt={roommate?.name || "Usuario"}
                  className="avatar-img"
                />
                <Avatar.Fallback className="avatar-fallback">
                  {roommate?.name?.charAt(0) || "?"}
                </Avatar.Fallback>
              </Avatar.Root>
              {roommate?.verified && (
                <div className="verified-badge">
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Verified className="verified-icon" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="tooltip">
                      <Text>Perfil verificado</Text>
                    </Tooltip.Content>
                  </Tooltip.Root>
                </div>
              )}
            </Box>
            {/* Nombre y edad */}
            <Flex align="center" gap="2">
              <Heading as="h3" size="3">
                {roommate?.name || "Desconocido"}
              </Heading>
              <Text size="2" color="gray">
                {roommate?.age || "--"} años
              </Text>
            </Flex>

            {/* Rating */}
            <Flex align="center" gap="1">
              <Star className="h-4 w-4 rating-star" color="var(--color-primary)" fill="var(--color-primary)" />
              <Text size="2" weight="medium">
                {roommate?.rating || "0"}
              </Text>
              <Text size="1" color="gray">
                ({roommate?.reviews || "0"})
              </Text>
            </Flex>
            
          </Flex>

          {/* Contenido principal */}
          <Flex direction="column" gap="2" className="property-info">


            {/* Ubicación */}
            <Flex align="center" gap="1">
              <MapPin className="h-4 w-4" />
              <Text size="2" color="gray">
                {roommate?.location || "Sin ubicación"}
              </Text>
            </Flex>

            {/* Estado apartamento */}
            <Badge
              variant="soft"
              radius="large"
              className={`apartment-badge ${roommate?.hasApartment ? 'apartment-badge--has' : 'apartment-badge--no'}`}
            >
              <Flex gap="1" align="center">
                <Home className="h-3 w-3" />
                <Text size="1">{roommate?.hasApartment ? 'Tiene casa' : 'No tiene casa'}</Text>
              </Flex>
            </Badge>

            {/* Presupuesto */}
            <Flex align="center" gap="1">
              <DollarSign className="h-4 w-4" color="var(--color-text-primary)" />
              <Text size="2">
                ${roommate?.budget?.min || 0} - ${roommate?.budget?.max || 0}
              </Text>
            </Flex>

            {/* Bio */}
            <Text size="2" color="gray">
              {roommate?.bio || "Sin descripción"}
            </Text>

            {/* Intereses */}
            <Flex gap="1" wrap="wrap">
              {roommate?.interests?.slice(0, 3)?.map((interest) => (
                <Badge key={interest} variant="soft" radius="full" color="purple">
                  <Text size="1">{interest}</Text>
                </Badge>
              ))}
              {roommate?.interests?.length > 3 && (
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Badge variant="soft" radius="full" color="gray">
                      <Text size="1">+{roommate.interests.length - 3}</Text>
                    </Badge>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <Text size="2" mb="1" weight="bold">
                      Otros intereses:
                    </Text>
                    <Flex gap="1" wrap="wrap">
                      {roommate.interests.slice(3).map((interest) => (
                        <Badge key={interest} variant="surface" color="gray">
                          <Text size="1">{interest}</Text>
                        </Badge>
                      ))}
                    </Flex>
                  </Tooltip.Content>
                </Tooltip.Root>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Tooltip.Provider>
  );
}